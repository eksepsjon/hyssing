import { useEffect, useState } from 'react'
import { tools, type Action, type ToolOptions } from './tools'

function toolFromHash(): string {
  const id = window.location.hash.slice(1)
  return tools.some((tool) => tool.id === id) ? id : tools[0].id
}

const indents = [
  { label: '2 spaces', value: '  ' },
  { label: '4 spaces', value: '    ' },
  { label: 'Tab', value: '\t' },
]

export default function App() {
  const [toolId, setToolId] = useState(toolFromHash)
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [options, setOptions] = useState<ToolOptions>({ indent: '  ', urlSafe: false })

  const tool = tools.find((t) => t.id === toolId)!

  useEffect(() => {
    const onHashChange = () => {
      setToolId(toolFromHash())
      setOutput('')
      setError('')
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  async function run(action: Action) {
    try {
      setOutput(await action.run(input, options))
      setError('')
    } catch (e) {
      setOutput('')
      setError((e as Error).message)
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  function useOutputAsInput() {
    setInput(output)
    setOutput('')
  }

  return (
    <div className="layout">
      <header>
        <h1>Hyssing</h1>
        <p className="tagline">Everything runs in your browser. Nothing leaves this page.</p>
        <nav>
          {tools.map((t) => (
            <a key={t.id} href={`#${t.id}`} className={t.id === toolId ? 'active' : ''}>
              {t.name}
            </a>
          ))}
        </nav>
      </header>

      <main>
        <p className="description">{tool.description}</p>

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
              <button className="link" onClick={copy} disabled={!output}>
                {copied ? 'Copied' : 'Copy'}
              </button>
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
      </main>
    </div>
  )
}
