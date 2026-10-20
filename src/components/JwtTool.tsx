import { useEffect, useMemo, useState } from 'react'
import { useNow } from '../hooks/useNow'
import { decodeJwt, isHmac, signJwt, verifyJwt } from '../tools/jwt'
import { relativeTime } from '../tools/time'
import CopyButton from './CopyButton'

type Mode = 'decode' | 'create'

export default function JwtTool() {
  const [mode, setMode] = useState<Mode>('decode')
  const [token, setToken] = useState('')

  function openInDecoder(created: string) {
    setToken(created)
    setMode('decode')
  }

  return (
    <>
      <div className="toolbar">
        <div className="segmented" role="tablist">
          <button role="tab" aria-selected={mode === 'decode'} onClick={() => setMode('decode')}>
            Decode &amp; verify
          </button>
          <button role="tab" aria-selected={mode === 'create'} onClick={() => setMode('create')}>
            Create
          </button>
        </div>
      </div>
      {mode === 'decode' ? <Decoder token={token} setToken={setToken} /> : <Creator onCreated={openInDecoder} />}
    </>
  )
}

function Decoder({ token, setToken }: { token: string; setToken: (token: string) => void }) {
  const [key, setKey] = useState('')
  const [verification, setVerification] = useState<{ valid?: boolean; error?: string }>({})
  const now = useNow(10_000)

  const decoded = useMemo(() => {
    if (!token.trim()) return undefined
    try {
      return { value: decodeJwt(token) }
    } catch (e) {
      return { error: (e as Error).message }
    }
  }, [token])

  const alg = decoded?.value?.header.alg

  useEffect(() => {
    let cancelled = false
    const result = !decoded?.value || !key ? Promise.resolve({}) : verifyJwt(token, key).then(
      (valid) => ({ valid }),
      (e: Error) => ({ error: e.message }),
    )
    result.then((value) => !cancelled && setVerification(value))
    return () => {
      cancelled = true
    }
  }, [token, key, decoded])

  return (
    <div className="panes">
      <section>
        <div className="pane-header">
          <h2>Token</h2>
          <button className="link" onClick={() => setToken('')} disabled={!token}>
            Clear
          </button>
        </div>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="eyJhbGciOi…"
          spellCheck={false}
          aria-label="Token"
          className="token"
        />
        <div className="pane-header">
          <h2>{isHmac(alg) ? 'Secret' : 'Public key (PEM or JWK)'}</h2>
        </div>
        <textarea
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder={isHmac(alg) ? 'your-256-bit-secret' : '-----BEGIN PUBLIC KEY-----\n…\n-----END PUBLIC KEY-----'}
          spellCheck={false}
          aria-label="Verification key"
          className="key"
        />
      </section>
      <section className="scroll">
        {!decoded && <p className="description">Paste a token to decode it.</p>}
        {decoded?.error && (
          <div className="error" role="alert">
            {decoded.error}
          </div>
        )}
        {decoded?.value && (
          <>
            <Status payload={decoded.value.payload} verification={verification} hasKey={!!key} now={now} />
            <JsonBlock title="Header" value={decoded.value.header} />
            <JsonBlock title="Payload" value={decoded.value.payload} />
            <Claims payload={decoded.value.payload} now={now} />
          </>
        )}
      </section>
    </div>
  )
}

function Status({
  payload,
  verification,
  hasKey,
  now: nowDate,
}: {
  payload: Record<string, unknown>
  verification: { valid?: boolean; error?: string }
  hasKey: boolean
  now: Date
}) {
  const now = nowDate.getTime() / 1000
  const { exp, nbf } = payload
  return (
    <div className="badges">
      {typeof exp === 'number' && exp < now && <span className="badge bad">Expired</span>}
      {typeof nbf === 'number' && nbf > now && <span className="badge bad">Not yet valid</span>}
      {typeof exp === 'number' && exp >= now && (typeof nbf !== 'number' || nbf <= now) && (
        <span className="badge good">Not expired</span>
      )}
      {!hasKey && <span className="badge">Signature not checked</span>}
      {verification.valid === true && <span className="badge good">Signature verified</span>}
      {verification.valid === false && <span className="badge bad">Invalid signature</span>}
      {verification.error && <span className="badge bad">{verification.error}</span>}
    </div>
  )
}

function JsonBlock({ title, value }: { title: string; value: unknown }) {
  const text = JSON.stringify(value, null, 2)
  return (
    <div className="block">
      <div className="pane-header">
        <h2>{title}</h2>
        <CopyButton text={text} />
      </div>
      <pre>{text}</pre>
    </div>
  )
}

const timeClaims: Record<string, string> = { iat: 'Issued at', nbf: 'Not before', exp: 'Expires' }

function Claims({ payload, now }: { payload: Record<string, unknown>; now: Date }) {
  const rows = Object.entries(timeClaims).filter(([claim]) => typeof payload[claim] === 'number')
  if (rows.length === 0) return null
  return (
    <div className="block">
      <div className="pane-header">
        <h2>Times</h2>
      </div>
      <dl className="kv">
        {rows.map(([claim, label]) => {
          const date = new Date((payload[claim] as number) * 1000)
          return (
            <div key={claim}>
              <dt>
                {label} <code>{claim}</code>
              </dt>
              <dd>
                {date.toLocaleString()} <span className="muted">({relativeTime(date, now)})</span>
              </dd>
            </div>
          )
        })}
      </dl>
    </div>
  )
}

function defaultPayload(): string {
  const now = Math.floor(Date.now() / 1000)
  return JSON.stringify({ sub: '1234567890', name: 'Jane Doe', iat: now, exp: now + 3600 }, null, 2)
}

function Creator({ onCreated }: { onCreated: (token: string) => void }) {
  const [header, setHeader] = useState('{\n  "alg": "HS256",\n  "typ": "JWT"\n}')
  const [payload, setPayload] = useState(defaultPayload)
  const [secret, setSecret] = useState('')
  const [token, setToken] = useState('')
  const [error, setError] = useState('')

  async function sign() {
    try {
      const parse = (text: string, name: string) => {
        try {
          return JSON.parse(text)
        } catch {
          throw new Error(`The ${name} is not valid JSON`)
        }
      }
      setToken(await signJwt(parse(header, 'header'), parse(payload, 'payload'), secret))
      setError('')
    } catch (e) {
      setToken('')
      setError((e as Error).message)
    }
  }

  return (
    <div className="panes">
      <section>
        <div className="pane-header">
          <h2>Header</h2>
        </div>
        <textarea value={header} onChange={(e) => setHeader(e.target.value)} spellCheck={false} aria-label="Header" className="key" />
        <div className="pane-header">
          <h2>Payload</h2>
        </div>
        <textarea value={payload} onChange={(e) => setPayload(e.target.value)} spellCheck={false} aria-label="Payload" />
        <div className="pane-header">
          <h2>Secret</h2>
        </div>
        <input
          type="text"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="Shared secret for HS256 / HS384 / HS512"
          spellCheck={false}
          aria-label="Secret"
        />
        <div className="toolbar">
          <button className="primary" onClick={sign}>
            Sign
          </button>
        </div>
      </section>
      <section>
        <div className="pane-header">
          <h2>Token</h2>
          <button className="link" onClick={() => onCreated(token)} disabled={!token}>
            Open in decoder
          </button>
          <CopyButton text={token} />
        </div>
        {error ? (
          <div className="error" role="alert">
            {error}
          </div>
        ) : (
          <textarea value={token} readOnly spellCheck={false} aria-label="Signed token" />
        )}
      </section>
    </div>
  )
}
