import { useState } from 'react'
import {
  countLines,
  filterLines,
  joinLines,
  removeEmptyLines,
  replaceInLines,
  reverseLines,
  shuffleLines,
  sortLines,
  splitLines,
  uniqueLines,
} from '../tools/lines'
import CopyButton from './CopyButton'

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`

export default function LinesTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [ignoreCase, setIgnoreCase] = useState(false)
  const [natural, setNatural] = useState(true)
  const [filter, setFilter] = useState('')
  const [find, setFind] = useState('')
  const [replacement, setReplacement] = useState('')

  function apply(operation: (lines: string[]) => string[]) {
    try {
      const split = splitLines(input)
      setOutput(joinLines({ ...split, lines: operation(split.lines) }))
      setError('')
    } catch (e) {
      setOutput('')
      setError((e as Error).message)
    }
  }

  function useOutputAsInput() {
    setInput(output)
    setOutput('')
  }

  const inputCount = countLines(input)
  const outputCount = countLines(output)

  return (
    <>
      <div className="operations">
        <div className="toolbar">
          <button onClick={() => apply((lines) => sortLines(lines, { ignoreCase, natural }))}>Sort A→Z</button>
          <button onClick={() => apply((lines) => sortLines(lines, { ignoreCase, natural, descending: true }))}>Sort Z→A</button>
          <button onClick={() => apply((lines) => uniqueLines(lines, { ignoreCase }))}>Remove duplicates</button>
          <button onClick={() => apply(shuffleLines)}>Shuffle</button>
          <button onClick={() => apply(reverseLines)}>Reverse</button>
          <button onClick={() => apply(removeEmptyLines)}>Remove empty</button>
        </div>
        <div className="toolbar">
          <label>
            <input type="checkbox" checked={ignoreCase} onChange={(e) => setIgnoreCase(e.target.checked)} />
            Ignore case
          </label>
          <label title="Sort numbers by value, so item2 comes before item10">
            <input type="checkbox" checked={natural} onChange={(e) => setNatural(e.target.checked)} />
            Natural number order
          </label>
        </div>
        <div className="toolbar op-row">
          <span className="op-label">Filter</span>
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Regular expression, e.g. ^error"
            spellCheck={false}
            aria-label="Filter regular expression"
          />
          <button onClick={() => apply((lines) => filterLines(lines, filter, { ignoreCase, keep: true }))}>Keep matching</button>
          <button onClick={() => apply((lines) => filterLines(lines, filter, { ignoreCase, keep: false }))}>Remove matching</button>
        </div>
        <div className="toolbar op-row">
          <span className="op-label">Replace</span>
          <input
            type="text"
            value={find}
            onChange={(e) => setFind(e.target.value)}
            placeholder="Regular expression, e.g. (\w+)@(\w+)"
            spellCheck={false}
            aria-label="Find regular expression"
          />
          <input
            type="text"
            value={replacement}
            onChange={(e) => setReplacement(e.target.value)}
            placeholder="Replacement, e.g. $2 ($1)"
            spellCheck={false}
            aria-label="Replacement"
          />
          <button onClick={() => apply((lines) => replaceInLines(lines, find, replacement, { ignoreCase }))}>Replace all</button>
        </div>
      </div>

      <div className="panes">
        <section>
          <div className="pane-header">
            <h2>Input</h2>
            <span className="muted small">{plural(inputCount, 'line')}</span>
            <button className="link" onClick={() => setInput('')} disabled={!input}>
              Clear
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={'One item\nper line…'}
            spellCheck={false}
            aria-label="Input"
          />
        </section>
        <section>
          <div className="pane-header">
            <h2>Output</h2>
            {output && <span className="muted small">{plural(outputCount, 'line')}</span>}
            <button className="link" onClick={useOutputAsInput} disabled={!output}>
              Use as input
            </button>
            <CopyButton text={output} />
          </div>
          {error ? (
            <div className="error" role="alert">
              {error}
            </div>
          ) : (
            <textarea value={output} readOnly spellCheck={false} aria-label="Output" />
          )}
        </section>
      </div>
    </>
  )
}
