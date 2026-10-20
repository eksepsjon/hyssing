export function encodeBase64(text: string, urlSafe = false): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  const encoded = btoa(binary)
  return urlSafe ? encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') : encoded
}

export function decodeBase64(input: string): string {
  // Accept both standard and URL-safe alphabets, with or without padding.
  let normalized = input.replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/')
  if (normalized.length % 4 === 1) throw new Error('Invalid Base64: wrong length')
  normalized = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')

  let binary: string
  try {
    binary = atob(normalized)
  } catch {
    throw new Error('Invalid Base64: contains characters outside the Base64 alphabet')
  }
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    throw new Error('Decoded data is not valid UTF-8 text')
  }
}
