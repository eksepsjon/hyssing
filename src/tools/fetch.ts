export interface FetchedResponse {
  status: number
  statusText: string
  headers: [string, string][]
  body: string
}

export const fetchMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD']

/**
 * Fetches a URL from the browser. Only works for sites that allow cross-origin requests (CORS);
 * the browser hides why a request failed, so the error says so.
 */
export async function fetchText(url: string, method = 'GET', body?: string): Promise<FetchedResponse> {
  let parsed: URL
  try {
    parsed = new URL(url.trim())
  } catch {
    throw new Error('Enter a full URL, like https://example.com/data.json')
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') throw new Error('Only http and https URLs can be fetched')

  let response: Response
  try {
    response = await fetch(parsed, { method, body: method === 'GET' || method === 'HEAD' ? undefined : body })
  } catch {
    throw new Error('Could not fetch: the site is unreachable, or it does not allow requests from other websites (CORS)')
  }
  return {
    status: response.status,
    statusText: response.statusText,
    headers: [...response.headers.entries()],
    body: await response.text(),
  }
}

/** Status line, headers, a blank line and the body, like a raw HTTP response. */
export function formatResponse({ status, statusText, headers, body }: FetchedResponse): string {
  return [`${status} ${statusText}`.trim(), ...headers.map(([name, value]) => `${name}: ${value}`), '', body].join('\n')
}
