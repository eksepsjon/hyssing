import { base64UrlToBytes, bytesToBase64Url, decodeBase64, encodeBase64 } from './base64'

export interface DecodedJwt {
  header: Record<string, unknown>
  payload: Record<string, unknown>
  signature: string
}

export function decodeJwt(token: string): DecodedJwt {
  const parts = token.trim().split('.')
  if (parts.length !== 3) throw new Error('A JWT has three parts separated by dots: header.payload.signature')
  return {
    header: decodePart(parts[0], 'header'),
    payload: decodePart(parts[1], 'payload'),
    signature: parts[2],
  }
}

function decodePart(part: string, name: string): Record<string, unknown> {
  let value: unknown
  try {
    value = JSON.parse(decodeBase64(part))
  } catch {
    throw new Error(`The ${name} is not Base64url-encoded JSON`)
  }
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`The ${name} must be a JSON object`)
  }
  return value as Record<string, unknown>
}

type Algorithm =
  | { kind: 'hmac'; params: HmacImportParams }
  | { kind: 'asymmetric'; importParams: RsaHashedImportParams | EcKeyImportParams; verifyParams: AlgorithmIdentifier | RsaPssParams | EcdsaParams }

function algorithmFor(alg: string): Algorithm {
  const bits = alg.slice(2)
  const hash = `SHA-${bits}`
  if (!['256', '384', '512'].includes(bits)) throw new Error(`Unsupported algorithm: ${alg}`)
  switch (alg.slice(0, 2)) {
    case 'HS':
      return { kind: 'hmac', params: { name: 'HMAC', hash } }
    case 'RS':
      return { kind: 'asymmetric', importParams: { name: 'RSASSA-PKCS1-v1_5', hash }, verifyParams: 'RSASSA-PKCS1-v1_5' }
    case 'PS':
      return {
        kind: 'asymmetric',
        importParams: { name: 'RSA-PSS', hash },
        verifyParams: { name: 'RSA-PSS', saltLength: Number(bits) / 8 },
      }
    case 'ES': {
      const namedCurve = { '256': 'P-256', '384': 'P-384', '512': 'P-521' }[bits]!
      return { kind: 'asymmetric', importParams: { name: 'ECDSA', namedCurve }, verifyParams: { name: 'ECDSA', hash } }
    }
    default:
      throw new Error(`Unsupported algorithm: ${alg}`)
  }
}

export function isHmac(alg: unknown): boolean {
  return typeof alg === 'string' && alg.startsWith('HS')
}

async function importPublicKey(key: string, params: RsaHashedImportParams | EcKeyImportParams): Promise<CryptoKey> {
  const trimmed = key.trim()
  if (trimmed.startsWith('{')) {
    return crypto.subtle.importKey('jwk', JSON.parse(trimmed), params, false, ['verify'])
  }
  const match = trimmed.match(/-----BEGIN PUBLIC KEY-----([\s\S]+?)-----END PUBLIC KEY-----/)
  if (!match) throw new Error('Provide the public key as a PEM "BEGIN PUBLIC KEY" block or as a JWK')
  const der = Uint8Array.from(atob(match[1].replace(/\s+/g, '')), (char) => char.charCodeAt(0))
  return crypto.subtle.importKey('spki', der, params, false, ['verify'])
}

/** Verifies the token's signature with an HMAC secret or a public key (PEM or JWK). */
export async function verifyJwt(token: string, key: string): Promise<boolean> {
  const [header, payload, signature] = token.trim().split('.')
  const { alg } = decodeJwt(token).header
  if (typeof alg !== 'string' || alg === 'none') throw new Error('The token has no signing algorithm to verify')
  const algorithm = algorithmFor(alg)
  const data = new TextEncoder().encode(`${header}.${payload}`)
  const signatureBytes = base64UrlToBytes(signature)

  if (algorithm.kind === 'hmac') {
    const cryptoKey = await crypto.subtle.importKey('raw', new TextEncoder().encode(key), algorithm.params, false, ['verify'])
    return crypto.subtle.verify('HMAC', cryptoKey, signatureBytes, data)
  }
  let cryptoKey: CryptoKey
  try {
    cryptoKey = await importPublicKey(key, algorithm.importParams)
  } catch (error) {
    throw new Error(`Could not read the public key: ${(error as Error).message}`)
  }
  return crypto.subtle.verify(algorithm.verifyParams, cryptoKey, signatureBytes, data)
}

/** Creates an HMAC-signed (HS256/384/512) token. */
export async function signJwt(header: Record<string, unknown>, payload: Record<string, unknown>, secret: string): Promise<string> {
  const alg = header.alg
  if (!isHmac(alg)) throw new Error('Signing supports HS256, HS384 and HS512')
  const algorithm = algorithmFor(alg as string)
  if (algorithm.kind !== 'hmac') throw new Error('Signing supports HS256, HS384 and HS512')
  const unsigned = `${encodeBase64(JSON.stringify(header), true)}.${encodeBase64(JSON.stringify(payload), true)}`
  const cryptoKey = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), algorithm.params, false, ['sign'])
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(unsigned))
  return `${unsigned}.${bytesToBase64Url(new Uint8Array(signature))}`
}
