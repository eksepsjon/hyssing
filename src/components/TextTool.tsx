import { useState } from 'react'
import type { Action, TextToolDefinition, ToolOptions } from '../tools/text'
import CopyButton from './CopyButton'

const indents = [
  { label: '2 spaces', value: '  ' },
  { label: '4 spaces', value: '    ' },
  { label: 'Tab', value: '\t' },
]

export default function TextTool({ tool }: { tool: TextToolDefinition }) {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [options, setOptions] = useState<ToolOptions>({ indent: '  ', urlSafe: false })

  async function run(action: Action) {
    try {
      setOutput(await action.run(input, options))
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

  return (
    <>
      <div className="toolbar">
        {tool.actions.map((action, i) => (
          <button key={action.label} className={i === 0 ? 'primary' : ''} onClick={() => run(action)}>
            {action.label}
          </button>
        ))}
        {tool.options.includes('indent') && (
          <label>
            Indent
            <select value={options.indent} onChange={(e) => setOptions({ ...options, indent: e.target.value })}>
              {indents.map((indent) => (
                <option key={indent.label} value={indent.value}>
                  {indent.label}
                </option>
              ))}
            </select>
          </label>
        )}
        {tool.options.includes('urlSafe') && (
          <label>
            <input
              type="checkbox"
              checked={options.urlSafe}
              onChange={(e) => setOptions({ ...options, urlSafe: e.target.checked })}
            />
            URL-safe
          </label>
        )}
      </div>

      <div className="panes">
        <section>
          <div className="pane-header">
            <h2>Input</h2>
            <button className="link" onClick={() => setInput('')} disabled={!input}>
              Clear
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={tool.placeholder}
            spellCheck={false}
            aria-label="Input"
          />
        </section>
        <section>
          <div className="pane-header">
            <h2>Output</h2>
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
