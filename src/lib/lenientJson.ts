/**
 * Forgiving JSON parser.
 *
 * Accepts everything JSON.parse accepts, plus common near-misses:
 * comments, trailing/missing commas, single-quoted strings, unquoted keys,
 * Python/JS literals (True, False, None, undefined, NaN, Infinity),
 * Python reprs (tuples, sets, u''/b''/r'' prefixes, triple quotes, Decimal(...) / datetime(...) style calls),
 * hex / leading-plus / leading-dot numbers, raw newlines inside strings,
 * unknown escapes and unclosed brackets at end of input.
 */

export class LenientJsonError extends Error {
  line: number;
  column: number;
  constructor(message: string, line: number, column: number) {
    super(`${message} (line ${line}, column ${column})`);
    this.name = 'LenientJsonError';
    this.line = line;
    this.column = column;
  }
}

const WORD_LITERALS: Record<string, unknown> = {
  true: true,
  false: false,
  null: null,
  True: true,
  False: false,
  None: null,
  TRUE: true,
  FALSE: false,
  NULL: null,
  undefined: null,
  NaN: null,
  Infinity: null,
  Ellipsis: null,
  '...': null,
};

const ESCAPES: Record<string, string> = {
  n: '\n',
  t: '\t',
  r: '\r',
  b: '\b',
  f: '\f',
  v: '\v',
  '0': '\0',
};

const isWs = (c: string) => c === ' ' || c === '\t' || c === '\n' || c === '\r' || c === ' ' || c === '﻿' || c === ' ' || c === ' ';
const isIdentStart = (c: string) => /[A-Za-z_$\u0080-￿]/.test(c);
const isIdentPart = (c: string) => /[A-Za-z0-9_$\u0080-￿-]/.test(c);

export function parseLenient(input: string): unknown {
  let i = 0;
  const n = input.length;

  const fail = (msg: string, at = i): never => {
    let line = 1;
    let col = 1;
    for (let k = 0; k < at && k < n; k++) {
      if (input[k] === '\n') {
        line++;
        col = 1;
      } else col++;
    }
    throw new LenientJsonError(msg, line, col);
  };

  const skip = () => {
    while (i < n) {
      const c = input[i];
      if (isWs(c)) i++;
      else if (c === '/' && input[i + 1] === '/') {
        while (i < n && input[i] !== '\n') i++;
      } else if (c === '#') {
        while (i < n && input[i] !== '\n') i++;
      } else if (c === '/' && input[i + 1] === '*') {
        const end = input.indexOf('*/', i + 2);
        i = end === -1 ? n : end + 2;
      } else break;
    }
  };

  const parseString = (quote: string, raw = false): string => {
    const triple = input.startsWith(quote.repeat(3), i);
    const closer = triple ? quote.repeat(3) : quote;
    i += closer.length; // opening quote(s)
    let out = '';
    while (i < n) {
      const c = input[i];
      if (input.startsWith(closer, i)) {
        i += closer.length;
        return out;
      }
      if (c === '\\' && raw) {
        out += c;
        i++;
        if (i < n) out += input[i++];
        continue;
      }
      if (c === '\\') {
        const e = input[i + 1];
        if (e === undefined) break;
        if (e === 'u') {
          const hex = input.slice(i + 2, i + 6);
          if (/^[0-9a-fA-F]{4}$/.test(hex)) {
            out += String.fromCharCode(parseInt(hex, 16));
            i += 6;
            continue;
          }
          out += 'u';
          i += 2;
          continue;
        }
        if (e === 'x') {
          const hex = input.slice(i + 2, i + 4);
          if (/^[0-9a-fA-F]{2}$/.test(hex)) {
            out += String.fromCharCode(parseInt(hex, 16));
            i += 4;
            continue;
          }
        }
        if (e === '\r' && input[i + 2] === '\n') {
          i += 3; // line continuation
          continue;
        }
        if (e === '\n') {
          i += 2;
          continue;
        }
        out += ESCAPES[e] ?? e;
        i += 2;
        continue;
      }
      out += c;
      i++;
    }
    // Unterminated string: be forgiving and return what we have.
    return out;
  };

  const parseNumberOrWord = (): unknown => {
    const start = i;
    while (i < n && /[^\s,:\]}{["'`()/#=]/.test(input[i])) i++;
    const token = input.slice(start, i);
    if (token === '') return fail(`Unexpected character '${input[i]}'`);
    // Python string prefixes: u'..', b'..', r'..', f'..', rb'..'
    if (/^(?:[ubrfUBRF]|[rR][bBfF]|[bBfF][rR])$/.test(token) && (input[i] === '"' || input[i] === "'")) {
      return parseString(input[i], /[rR]/.test(token));
    }
    // Calls such as Decimal('1.5'), datetime.datetime(2020, 1, 1), ObjectId("..."), Foo(a=1)
    if (input[i] === '(' && /^[A-Za-z_$][\w$.]*$/.test(token)) return parseCall();
    if (token in WORD_LITERALS) return WORD_LITERALS[token];
    if (token === '-Infinity' || token === '+Infinity' || token === '-NaN') return null;
    if (/^[+-]?(\d[\d_]*\.?[\d_]*|\.\d+)([eE][+-]?\d+)?[lLjJ]?$/.test(token)) return Number(token.replace(/[_lLjJ]/g, ''));
    if (/^[+-]?0[xX][0-9a-fA-F]+$/.test(token)) {
      const neg = token[0] === '-';
      const v = parseInt(token.replace(/^[+-]/, ''), 16);
      return neg ? -v : v;
    }
    // Bare word: treat as string so the user still gets a view.
    if (isIdentStart(token[0])) return token;
    return fail(`Unexpected token '${token}'`, start);
  };

  const parseKey = (): string => {
    const c = input[i];
    if (c === '"' || c === "'" || c === '`') return parseString(c);
    const start = i;
    while (i < n && isIdentPart(input[i])) i++;
    if (i === start) {
      // numeric-ish keys like 1.5 or +1
      while (i < n && /[^\s:,}\]"']/.test(input[i])) i++;
    }
    if (i === start) return fail(`Unexpected character '${input[i] ?? 'end of input'}', expected a key`);
    return input.slice(start, i);
  };

  const parseObject = (implicit = false): Record<string, unknown> | unknown[] => {
    if (!implicit) {
      i++; // {
      // Python set / JS-style value list: {1, 2, 3} or {'a', 'b'}
      const save = i;
      skip();
      if (i < n && input[i] !== '}' && input[i] !== ',') {
        try {
          parseKey();
          skip();
          if (i < n && input[i] !== ':' && input[i] !== '=') {
            i = save;
            return parseArray('}', false);
          }
        } catch {
          i = save;
          return parseArray('}', false);
        }
      }
      i = save;
    }
    const obj: Record<string, unknown> = {};
    for (;;) {
      skip();
      if (i >= n) return obj; // auto-close
      if (input[i] === '}' && !implicit) {
        i++;
        return obj;
      }
      if (input[i] === ',') {
        i++;
        continue;
      }
      const key = parseKey();
      skip();
      if (input[i] === ':' || input[i] === '=') i++;
      else if (i >= n || input[i] === '}' || input[i] === ',') {
        obj[key] = null; // key without value
        continue;
      } else fail(`Expected ':' after key "${key}"`);
      skip();
      if (i >= n || input[i] === '}' || input[i] === ',') {
        obj[key] = null;
        continue;
      }
      obj[key] = parseValue();
    }
  };

  const parseArray = (close = ']', consumeOpen = true): unknown[] => {
    if (consumeOpen) i++; // [ or (
    const arr: unknown[] = [];
    for (;;) {
      skip();
      if (i >= n) return arr; // auto-close
      if (input[i] === close) {
        i++;
        return arr;
      }
      if (input[i] === ',') {
        i++;
        continue;
      }
      arr.push(parseValue());
    }
  };

  const parseCall = (): unknown => {
    i++; // (
    const args: unknown[] = [];
    const kwargs: Record<string, unknown> = {};
    let hasKw = false;
    for (;;) {
      skip();
      if (i >= n) break;
      if (input[i] === ')') {
        i++;
        break;
      }
      if (input[i] === ',') {
        i++;
        continue;
      }
      const m = /^([A-Za-z_$][\w$]*)\s*=(?!=)/.exec(input.slice(i, i + 200));
      if (m) {
        i += m[0].length;
        hasKw = true;
        kwargs[m[1]] = parseValue();
      } else args.push(parseValue());
    }
    if (hasKw) return args.length ? { args, ...kwargs } : kwargs;
    if (args.length === 0) return null;
    return args.length === 1 ? args[0] : args;
  };

  const parseValue = (): unknown => {
    skip();
    if (i >= n) return fail('Unexpected end of input');
    const c = input[i];
    if (c === '{') return parseObject();
    if (c === '[') return parseArray();
    if (c === '(') return parseArray(')');
    if (c === '"' || c === "'" || c === '`') return parseString(c);
    if (c === '}' || c === ']' || c === ')' || c === ':') return fail(`Unexpected '${c}'`);
    return parseNumberOrWord();
  };

  skip();
  if (i >= n) return fail('Unexpected end of input');

  // A fragment like `"key": [...]` pasted without its enclosing braces.
  const looksLikeKey = /^(?:"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|[A-Za-z_$][\w$-]*)\s*:/;
  if (looksLikeKey.test(input.slice(i, i + 500))) return parseObject(true);

  const value = parseValue();
  skip();
  if (i < n) {
    // Several top-level values (e.g. NDJSON): collect them into an array.
    const values = [value];
    while (i < n) {
      values.push(parseValue());
      skip();
    }
    return values;
  }
  return value;
}
