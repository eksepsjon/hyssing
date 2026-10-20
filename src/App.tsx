import { Suspense, useEffect, useState } from 'react'
import { tools } from './registry'

// Old tab ids that still open the tool they were renamed to.
const renamed: Record<string, string> = { lines: 'text' }

function toolFromHash(): string {
  const hash = window.location.hash.slice(1)
  const id = renamed[hash] ?? hash
  return tools.some((tool) => tool.id === id) ? id : tools[0].id
}

export default function App() {
  const [toolId, setToolId] = useState(toolFromHash)
  const tool = tools.find((t) => t.id === toolId)!

  useEffect(() => {
    const onHashChange = () => setToolId(toolFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

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
        {/* Keyed by tool so each tool starts with fresh state when switched to. */}
        <Suspense key={tool.id} fallback={<p className="description">Loading…</p>}>
          {tool.render()}
        </Suspense>
      </main>
    </div>
  )
}
