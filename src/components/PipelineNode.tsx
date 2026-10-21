import { Handle, Position, useNodeConnections, type NodeProps } from '@xyflow/react'
import { useContext } from 'react'
import { PipelineContext, type PipelineFlowNode } from '../pipeline/context'
import { nodeTypeMap, type ParamDef, type ParamValue } from '../pipeline/nodeTypes'

const previewLines = 6

function preview(output: string): string {
  const lines = output.replace(/\n$/, '').split('\n')
  const shown = lines.slice(0, previewLines).map((line) => (line.length > 60 ? `${line.slice(0, 60)}…` : line))
  const more = lines.length - previewLines
  if (more > 0) shown.push(`… ${more} more line${more === 1 ? '' : 's'}`)
  return shown.join('\n')
}

export default function PipelineNode({ id, data, selected }: NodeProps<PipelineFlowNode>) {
  const { results, setParam, remove } = useContext(PipelineContext)
  const def = nodeTypeMap.get(data.type)
  const result = results.get(id)
  const connections = useNodeConnections({ handleType: 'target' })
  const isConnected = (port: number) => connections.some((connection) => connection.targetHandle === `in-${port}`)
  if (!def) return <div className="pipeline-node error">Unknown node: {data.type}</div>

  return (
    <div className={`pipeline-node ${result?.status ?? ''} ${selected ? 'selected' : ''}`}>
      {def.inputs.map((name, port) => (
        <Handle
          key={name}
          type="target"
          position={Position.Left}
          id={`in-${port}`}
          className={def.optionalInputs?.includes(port) ? 'optional' : undefined}
          style={{ top: `${((port + 1) / (def.inputs.length + 1)) * 100}%` }}
          title={def.optionalInputs?.includes(port) ? `Input ${name} (optional)` : `Input ${name}`}
        >
          {def.inputs.length > 1 && <span className="port-label">{name}</span>}
        </Handle>
      ))}
      <div className="pipeline-node-header">
        <span>{def.label}</span>
        <button className="link nodrag" onClick={() => remove(id)} aria-label={`Delete ${def.label}`} title="Delete node">
          ×
        </button>
      </div>
      {def.params.length > 0 && (
        <div className="pipeline-node-params nodrag">
          {def.params.map((param) => (
            <Param
              key={param.key}
              param={param}
              value={data.params[param.key] ?? param.default}
              onChange={(value) => setParam(id, param.key, value)}
              suppliedBy={
                'fromInput' in param && param.fromInput !== undefined && isConnected(param.fromInput)
                  ? def.inputs[param.fromInput]
                  : undefined
              }
            />
          ))}
        </div>
      )}
      {/* A node that holds its own text (Input) already shows its output in that field. */}
      {(!def.params.some((param) => param.kind === 'textarea') || result?.status !== 'ok') && (
        <pre className="pipeline-node-preview">
          {!result && '…'}
          {result?.status === 'ok' && (result.output === '' ? <span className="muted">(empty)</span> : preview(result.output))}
          {result && result.status !== 'ok' && result.message}
        </pre>
      )}
      <Handle type="source" position={Position.Right} id="out" title="Output" />
    </div>
  )
}

function Param({
  param,
  value,
  onChange,
  suppliedBy,
}: {
  param: ParamDef
  value: ParamValue
  onChange: (value: ParamValue) => void
  /** Name of the connected input port that provides this value instead. */
  suppliedBy?: string
}) {
  switch (param.kind) {
    case 'checkbox':
      return (
        <label className="check">
          <input type="checkbox" checked={value as boolean} onChange={(e) => onChange(e.target.checked)} />
          {param.label}
        </label>
      )
    case 'select':
      return (
        <label>
          <span>{param.label}</span>
          <select value={value as string} onChange={(e) => onChange(e.target.value)}>
            {param.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      )
    case 'textarea':
      return (
        <textarea
          className="nowheel"
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          placeholder={param.placeholder}
          spellCheck={false}
          aria-label={param.label}
          rows={6}
        />
      )
    default:
      return (
        <>
          <label>
            <span>{param.label}</span>
            <input
              type="text"
              value={suppliedBy ? '' : (value as string)}
              onChange={(e) => onChange(e.target.value)}
              placeholder={suppliedBy ? `From ${suppliedBy}` : param.placeholder}
              disabled={!!suppliedBy}
              spellCheck={false}
            />
          </label>
          {param.hint && (
            <details className="hint">
              <summary>Help</summary>
              {param.hint.split('; ').map((line) => (
                <div key={line}>{line}</div>
              ))}
            </details>
          )}
        </>
      )
  }
}
