import { useMemo, useState } from 'react'
import { useNow } from '../hooks/useNow'
import { describeTime, parseTime } from '../tools/time'
import CopyButton from './CopyButton'

const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone
const zones = (() => {
  const all = Intl.supportedValuesOf?.('timeZone') ?? []
  return ['UTC', ...all.filter((zone) => zone !== 'UTC')]
})()

export default function TimeTool() {
  const now = useNow()
  const [zone, setZone] = useState(localZone)
  const [input, setInput] = useState('')

  const converted = useMemo(() => {
    if (!input.trim()) return undefined
    try {
      return { value: parseTime(input) }
    } catch (e) {
      return { error: (e as Error).message }
    }
  }, [input])

  return (
    <>
      <div className="toolbar">
        <label>
          Time zone
          <select value={zone} onChange={(e) => setZone(e.target.value)}>
            {(zones.includes(zone) ? zones : [zone, ...zones]).map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="panes auto">
        <section className="card">
          <div className="pane-header">
            <h2>Now</h2>
          </div>
          <p className="clock">
            {now.toLocaleTimeString('en-GB', { timeZone: zone })}
            <span className="muted"> {now.toLocaleDateString('en-GB', { timeZone: zone, dateStyle: 'long' })}</span>
          </p>
          <Rows rows={describeTime(now, zone, now).filter((row) => row.label !== 'Relative')} />
        </section>

        <section className="card">
          <div className="pane-header">
            <h2>Convert</h2>
            <button className="link" onClick={() => setInput(String(Math.floor(Date.now() / 1000)))}>
              Use current time
            </button>
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="1700000000, 1700000000000 or 2024-05-17T08:00:00Z"
            spellCheck={false}
            aria-label="Timestamp or date"
          />
          {converted?.error && (
            <div className="error" role="alert">
              {converted.error}
            </div>
          )}
          {converted?.value && (
            <>
              <p className="muted small">
                {converted.value.unit ? `Read as a Unix timestamp in ${converted.value.unit}.` : 'Read as a date.'}
              </p>
              <Rows rows={describeTime(converted.value.date, zone, now)} />
            </>
          )}
          {!converted && (
            <p className="muted small">
              Paste a Unix timestamp (seconds, milliseconds, microseconds or nanoseconds are detected from its length) or a
              date such as an ISO 8601 string.
            </p>
          )}
        </section>
      </div>
    </>
  )
}

function Rows({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <dl className="kv">
      {rows.map((row) => (
        <div key={row.label}>
          <dt>{row.label}</dt>
          <dd>
            <code>{row.value}</code>
            <CopyButton text={row.value} />
          </dd>
        </div>
      ))}
    </dl>
  )
}
