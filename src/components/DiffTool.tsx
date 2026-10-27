import { useDeferredValue, useMemo, useState } from 'react'
import {
  canonicalJson,
  diffJson,
  diffStats,
  diffText,
  unifiedDiff,
  withContext,
  type DiffLine,
  type JsonChange,
  type Segment,
} from '../tools/diff'
import { parseJson } from '../tools/json'
import CopyButton from './CopyButton'

type Mode = 'text' | 'json'

const placeholders: Record<Mode, [string, string]> = {
  text: ['Paste the original text…', 'Paste the changed text…'],
  json: ['{"name": "Ada", "tags": ["a", "b"]}', '{"name": "Ada Lovelace", "tags": ["a", "c"]}'],
}

export default function DiffTool() {
  const [mode, setMode] = useState<Mode>('text')
  const [before, setBefore] = useState('')
  const [after, setAfter] = useState('')

  function swap() {
    setBefore(after)
    setAfter(before)
  }

  return (
    <>
      <div className="toolbar">
        <div className="segmented" role="tablist">
          <button role="tab" aria-selected={mode === 'text'} onClick={() => setMode('text')}>
            Text
          </button>
          <button role="tab" aria-selected={mode === 'json'} onClick={() => setMode('json')}>
            JSON
          </button>
        </div>
        <button onClick={swap} disabled={!before && !after}>
          Swap sides
        </button>
      </div>

      <div className="panes compact">
        <Input label="Original" value={before} onChange={setBefore} placeholder={placeholders[mode][0]} />
        <Input label="Changed" value={after} onChange={setAfter} placeholder={placeholders[mode][1]} />
      </div>

      {mode === 'text' ? <TextDiff before={before} after={after} /> : <JsonDiff before={before} after={after} />}
    </>
  )
}

function Input(props: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <section>
      <div className="pane-header">
        <h2>{props.label}</h2>
        <button className="link" onClick={() => props.onChange('')} disabled={!props.value}>
          Clear
        </button>
      </div>
      <textarea
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        spellCheck={false}
        aria-label={props.label}
      />
    </section>
  )
}

function TextDiff({ before, after }: { before: string; after: string }) {
  const [ignoreCase, setIgnoreCase] = useState(false)
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false)
  const deferredBefore = useDeferredValue(before)
  const deferredAfter = useDeferredValue(after)
  const lines = useMemo(
    () => diffText(deferredBefore, deferredAfter, { ignoreCase, ignoreWhitespace }),
    [deferredBefore, deferredAfter, ignoreCase, ignoreWhitespace],
  )

  return (
    <section>
      <div className="toolbar">
        <label>
          <input type="checkbox" checked={ignoreCase} onChange={(e) => setIgnoreCase(e.target.checked)} />
          Ignore case
        </label>
        <label>
          <input type="checkbox" checked={ignoreWhitespace} onChange={(e) => setIgnoreWhitespace(e.target.checked)} />
          Ignore whitespace
        </label>
      </div>
      <DiffView lines={lines} empty={!before && !after} />
    </section>
  )
}

function JsonDiff({ before, after }: { before: string; after: string }) {
  const [ignoreArrayOrder, setIgnoreArrayOrder] = useState(false)
  const [view, setView] = useState<'changes' | 'text'>('changes')
  const deferredBefore = useDeferredValue(before)
  const deferredAfter = useDeferredValue(after)

  const result = useMemo(() => {
    if (!deferredBefore.trim() || !deferredAfter.trim()) return undefined
    try {
      const changes = diffJson(deferredBefore, deferredAfter, { ignoreArrayOrder })
      // Normalized text: keys sorted and (optionally) arrays sorted, so only real differences show.
      const normalize = (text: string) => {
        const value = parseJson(text)
        return canonicalJson(ignoreArrayOrder ? sortArrays(value) : value, 2)
      }
      return { changes, lines: diffText(normalize(deferredBefore), normalize(deferredAfter)) }
    } catch (e) {
      return { error: (e as Error).message }
    }
  }, [deferredBefore, deferredAfter, ignoreArrayOrder])

  return (
    <section>
      <div className="toolbar">
        <div className="segmented" role="tablist">
          <button role="tab" aria-selected={view === 'changes'} onClick={() => setView('changes')}>
            Changes
          </button>
          <button role="tab" aria-selected={view === 'text'} onClick={() => setView('text')}>
            Line diff
          </button>
        </div>
        <label title="Match array items wherever they are, as if each array were a set">
          <input type="checkbox" checked={ignoreArrayOrder} onChange={(e) => setIgnoreArrayOrder(e.target.checked)} />
          Ignore array order
        </label>
        <span className="muted small">Object key order is always ignored.</span>
      </div>
      {!result ? (
        <p className="muted">Paste JSON on both sides to compare.</p>
      ) : 'error' in result ? (
        <div className="error compact" role="alert">
          {result.error}
        </div>
      ) : view === 'changes' ? (
        <ChangeList changes={result.changes!} />
      ) : (
        <DiffView lines={result.lines!} empty={false} />
      )}
    </section>
  )
}

function sortArrays(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value
      .map(sortArrays)
      .map((item) => ({ item, key: canonicalJson(item) }))
      .sort((x, y) => (x.key < y.key ? -1 : x.key > y.key ? 1 : 0))
      .map(({ item }) => item)
  }
  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, sortArrays(item)]))
  }
  return value
}

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`

function DiffView({ lines, empty }: { lines: DiffLine[]; empty: boolean }) {
  const [showAll, setShowAll] = useState(false)
  const stats = diffStats(lines)
  const rows = showAll ? lines : withContext(lines)
  const identical = stats.added === 0 && stats.removed === 0

  return (
    <>
      <div className="pane-header diff-header">
        <h2>Differences</h2>
        {!empty && !identical && (
          <span className="small">
            <span className="diff-added-count">+{stats.added}</span> <span className="diff-removed-count">−{stats.removed}</span>
          </span>
        )}
        <label className="muted small">
          <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
          Show unchanged lines
        </label>
        <CopyButton text={unifiedDiff(lines)} label="Copy as patch" />
      </div>
      {empty ? (
        <p className="muted">Paste text on both sides to compare.</p>
      ) : identical && !showAll ? (
        <p className="badges">
          <span className="badge good">No differences</span>
        </p>
      ) : (
        <div className="diff" role="table" aria-label="Differences">
          {rows.map((row, index) =>
            row.type === 'skip' ? (
              <div key={index} className="diff-row skip" role="row">
                <span role="cell">⋯ {plural(row.count, 'unchanged line')}</span>
              </div>
            ) : (
              <div key={index} className={`diff-row ${row.type}`} role="row">
                <span className="diff-no" role="cell">
                  {row.oldNo}
                </span>
                <span className="diff-no" role="cell">
                  {row.newNo}
                </span>
                <span className="diff-sign" role="cell" aria-label={row.type === 'equal' ? undefined : row.type === 'add' ? 'added' : 'removed'}>
                  {row.type === 'add' ? '+' : row.type === 'remove' ? '−' : ''}
                </span>
                <span className="diff-text" role="cell">
                  {row.segments ? <Segments segments={row.segments} /> : row.text || ' '}
                </span>
              </div>
            ),
          )}
        </div>
      )}
    </>
  )
}

function Segments({ segments }: { segments: Segment[] }) {
  return segments.map((segment, index) => (segment.changed ? <mark key={index}>{segment.text}</mark> : <span key={index}>{segment.text}</span>))
}

const show = (value: unknown) => JSON.stringify(value, null, 2)

function ChangeList({ changes }: { changes: JsonChange[] }) {
  if (changes.length === 0) {
    return (
      <p className="badges">
        <span className="badge good">No differences</span>
      </p>
    )
  }
  const count = (kind: JsonChange['kind']) => changes.filter((change) => change.kind === kind).length
  const report = changes
    .map((change) =>
      change.kind === 'changed'
        ? `~ ${change.path}: ${JSON.stringify(change.before)} → ${JSON.stringify(change.after)}`
        : `${change.kind === 'added' ? '+' : '-'} ${change.path}: ${JSON.stringify(change.kind === 'added' ? change.after : change.before)}`,
    )
    .join('\n')

  return (
    <>
      <div className="pane-header diff-header">
        <h2>{plural(changes.length, 'difference')}</h2>
        <span className="small">
          <span className="diff-added-count">{count('added')} added</span> ·{' '}
          <span className="diff-removed-count">{count('removed')} removed</span> · {count('changed')} changed
        </span>
        <CopyButton text={report} label="Copy list" />
      </div>
      <ul className="json-changes">
        {changes.map((change, index) => (
          <li key={index} className={change.kind}>
            <span className={`badge ${change.kind === 'added' ? 'good' : change.kind === 'removed' ? 'bad' : ''}`}>{change.kind}</span>
            <code className="json-path">{change.path}</code>
            <div className="json-values">
              {change.kind !== 'added' && <pre className="remove">{show(change.before)}</pre>}
              {change.kind === 'changed' && <span className="muted">→</span>}
              {change.kind !== 'removed' && <pre className="add">{show(change.after)}</pre>}
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
