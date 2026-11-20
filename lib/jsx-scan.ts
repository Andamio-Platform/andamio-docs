/* Small, dependency-free scanning of MDX source: fenced code, JS strings and
   comments, and component tags. Enough to turn a page into markdown safely; not
   a full MDX parser. */

const FENCE = /^\s*(`{3,}|~{3,})/;

/** For each line of `mdx`, whether it belongs to a fenced code block (fence
    lines included). */
export function fencedLines(mdx: string): boolean[] {
  let fence: string | null = null;
  return mdx.split("\n").map((line) => {
    const m = FENCE.exec(line);
    if (fence === null) {
      if (!m) return false;
      fence = m[1];
    } else if (m && m[1][0] === fence[0] && m[1].length >= fence.length && line.trim() === m[1]) {
      // A fence closes on the same character, at least as long, with nothing after it.
      fence = null;
    }
    return true;
  });
}

/** `mdx` with every fenced code block blanked to spaces, so indices still
    line up with the original. */
export function maskFences(mdx: string): string {
  const fenced = fencedLines(mdx);
  return mdx
    .split("\n")
    .map((line, i) => (fenced[i] ? " ".repeat(line.length) : line))
    .join("\n");
}

/** Index just past the JS string, template literal or comment starting at `i`,
    or `i` itself when none starts there. */
export function skipJsToken(text: string, i: number): number {
  const c = text[i];
  if (c === '"' || c === "'" || c === "`") {
    let j = i + 1;
    while (j < text.length && text[j] !== c) j += text[j] === "\\" ? 2 : 1;
    return Math.min(j + 1, text.length);
  }
  if (c === "/" && text[i + 1] === "/") {
    const n = text.indexOf("\n", i);
    return n === -1 ? text.length : n;
  }
  if (c === "/" && text[i + 1] === "*") {
    const n = text.indexOf("*/", i + 2);
    return n === -1 ? text.length : n + 2;
  }
  return i;
}

/* Index just past the balanced `{…}` expression starting at `i`. */
function skipBraces(text: string, i: number): number {
  let depth = 0;
  let j = i;
  while (j < text.length) {
    const k = skipJsToken(text, j);
    if (k !== j) {
      j = k;
      continue;
    }
    if (text[j] === "{") depth++;
    else if (text[j] === "}" && --depth === 0) return j + 1;
    j++;
  }
  return text.length;
}

/* Index just past the inline code span or MDX comment starting at `i`, or `i`. */
function skipInline(text: string, i: number): number {
  if (text[i] === "`") {
    let n = 0;
    while (text[i + n] === "`") n++;
    const close = new RegExp(`(?<!\`)\`{${n}}(?!\`)`, "g");
    close.lastIndex = i + n;
    const m = close.exec(text);
    return m ? m.index + n : i + n;
  }
  if (text.startsWith("{/*", i)) {
    const n = text.indexOf("*/}", i + 3);
    return n === -1 ? text.length : n + 3;
  }
  return i;
}

export type JsxTag = {
  name: string;
  /** Index of the `<`. */
  start: number;
  /** Index just past the tag's closing `>`. */
  end: number;
  /** Everything between the name and `>` (or `/>`), as written. */
  attrs: string;
  selfClosing: boolean;
};

/** Every opening tag of a capitalized component in `text`, outside inline code
    and MDX comments. Attribute values are read whole: quotes and `{…}`
    (strings, comments, nested tags) are skipped, so a `>` inside one does not
    end the tag. Pass text with fenced code masked (`maskFences`). */
export function scanJsxTags(text: string): JsxTag[] {
  const tags: JsxTag[] = [];
  let i = 0;
  while (i < text.length) {
    const skipped = skipInline(text, i);
    if (skipped !== i) {
      i = skipped;
      continue;
    }
    const name = text[i] === "<" ? /^[A-Z][\w.]*/.exec(text.slice(i + 1, i + 80)) : null;
    if (!name) {
      i++;
      continue;
    }
    const attrsStart = i + 1 + name[0].length;
    let j = attrsStart;
    let end = -1;
    let selfClosing = false;
    while (j < text.length) {
      const c = text[j];
      if (c === '"' || c === "'") {
        const q = text.indexOf(c, j + 1);
        j = q === -1 ? text.length : q + 1;
      } else if (c === "{") {
        j = skipBraces(text, j);
      } else if (c === "/" && text[j + 1] === ">") {
        selfClosing = true;
        end = j + 2;
        break;
      } else if (c === ">") {
        end = j + 1;
        break;
      } else {
        j++;
      }
    }
    if (end === -1) {
      i++;
      continue;
    }
    tags.push({
      name: name[0],
      start: i,
      end,
      attrs: text.slice(attrsStart, end - (selfClosing ? 2 : 1)),
      selfClosing,
    });
    i = end;
  }
  return tags;
}
