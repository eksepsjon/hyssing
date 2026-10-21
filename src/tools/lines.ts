/** Text split into lines, remembering whether it ended with a newline so joining restores it. */
export interface Lines {
  lines: string[]
  trailingNewline: boolean
}

export function splitLines(text: string): Lines {
  const lines = text.split(/\r?\n/)
  const trailingNewline = lines.length > 1 && lines[lines.length - 1] === ''
  if (trailingNewline) lines.pop()
  return { lines, trailingNewline }
}

export function joinLines({ lines, trailingNewline }: Lines): string {
  return lines.join('\n') + (trailingNewline && lines.length > 0 ? '\n' : '')
}

export function countLines(text: string): number {
  return text === '' ? 0 : splitLines(text).lines.length
}

export interface CompareOptions {
  ignoreCase?: boolean
}

/** Alphabets offered for sorting. Letters like å, ä and ø sort differently per language. */
export const sortLocales = [
  { value: 'nb', label: 'Norwegian (æ ø å after z)' },
  { value: 'da', label: 'Danish (æ ø å after z)' },
  { value: 'sv', label: 'Swedish (å ä ö after z)' },
  { value: 'fi', label: 'Finnish (å ä ö after z)' },
  { value: 'de', label: 'German (ä ö ü with a o u)' },
  { value: 'en', label: 'English (å with a)' },
]

export function sortLines(
  lines: string[],
  options: CompareOptions & { descending?: boolean; natural?: boolean; locale?: string } = {},
): string[] {
  const collator = new Intl.Collator(options.locale, {
    numeric: options.natural,
    sensitivity: options.ignoreCase ? 'accent' : 'variant',
  })
  const sorted = [...lines].sort(collator.compare)
  return options.descending ? sorted.reverse() : sorted
}

/** Removes repeated lines, keeping the first occurrence of each. */
export function uniqueLines(lines: string[], options: CompareOptions = {}): string[] {
  const seen = new Set<string>()
  return lines.filter((line) => {
    const key = options.ignoreCase ? line.toLocaleLowerCase() : line
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/** Fisher–Yates shuffle. `random` returns a number in [0, 1), like Math.random. */
export function shuffleLines(lines: string[], random: () => number = Math.random): string[] {
  const shuffled = [...lines]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/** A repeatable random number generator (mulberry32) seeded from any string. */
export function seededRandom(seed: string): () => number {
  let state = 0
  for (const char of seed) state = (Math.imul(state, 31) + char.charCodeAt(0)) | 0
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function reverseLines(lines: string[]): string[] {
  return [...lines].reverse()
}

export function removeEmptyLines(lines: string[]): string[] {
  return lines.filter((line) => line.trim() !== '')
}

function compile(pattern: string, flags: string): RegExp {
  if (pattern === '') throw new Error('Enter a regular expression')
  try {
    return new RegExp(pattern, flags)
  } catch (error) {
    // Browsers word this differently, and some already start with "Invalid regular expression".
    const message = (error as Error).message.replace(/^Invalid regular expression:\s*/i, '')
    throw new Error(`Invalid regular expression: ${message}`)
  }
}

/** Keeps (or with `keep: false`, removes) the lines matching `pattern`. */
export function filterLines(lines: string[], pattern: string, options: CompareOptions & { keep: boolean }): string[] {
  const regex = compile(pattern, options.ignoreCase ? 'iu' : 'u')
  return lines.filter((line) => regex.test(line) === options.keep)
}

/**
 * Replaces every match of `pattern` within each line. The replacement may use $1, $<name> and $&,
 * unless `literal` is set, in which case it is inserted exactly as given.
 */
export function replaceInLines(
  lines: string[],
  pattern: string,
  replacement: string,
  options: CompareOptions & { literal?: boolean } = {},
): string[] {
  const regex = compile(pattern, options.ignoreCase ? 'giu' : 'gu')
  return lines.map((line) => (options.literal ? line.replace(regex, () => replacement) : line.replace(regex, replacement)))
}
