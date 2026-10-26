export function formatJson(input: string, indent: number | string = 2): string {
  return JSON.stringify(parseJson(input), null, indent)
}

export function minifyJson(input: string): string {
  return JSON.stringify(parseJson(input))
}

export function parseJson(input: string): unknown {
  try {
    return JSON.parse(input)
  } catch (error) {
    throw new Error(`Invalid JSON: ${(error as Error).message}`)
  }
}
