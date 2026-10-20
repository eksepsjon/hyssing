function parseXml(input: string): Document {
  const doc = new DOMParser().parseFromString(input.trim(), 'application/xml')
  const error = doc.getElementsByTagName('parsererror')[0]
  if (error) {
    const message = error.textContent?.trim().split('\n')[0] ?? 'unknown error'
    throw new Error(`Invalid XML: ${message}`)
  }
  return doc
}

function escapeText(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function escapeAttribute(value: string): string {
  return escapeText(value).replace(/"/g, '&quot;')
}

function serializeElement(element: Element, indent: string, newline: string, depth: number): string {
  const pad = indent.repeat(depth)
  const attributes = Array.from(element.attributes)
    .map((attr) => ` ${attr.name}="${escapeAttribute(attr.value)}"`)
    .join('')
  const open = `${pad}<${element.tagName}${attributes}`

  // Drop whitespace-only text between elements; that's the layout we're replacing.
  const children = Array.from(element.childNodes).filter(
    (node) => !(node.nodeType === Node.TEXT_NODE && !node.textContent?.trim()),
  )
  if (children.length === 0) return `${open}/>`

  // Keep short text-only elements on a single line: <name>value</name>
  if (children.length === 1 && children[0].nodeType === Node.TEXT_NODE) {
    return `${open}>${escapeText(children[0].textContent!.trim())}</${element.tagName}>`
  }

  const inner = children.map((child) => serializeNode(child, indent, newline, depth + 1)).join(newline)
  return `${open}>${newline}${inner}${newline}${pad}</${element.tagName}>`
}

function serializeNode(node: Node, indent: string, newline: string, depth: number): string {
  const pad = indent.repeat(depth)
  switch (node.nodeType) {
    case Node.ELEMENT_NODE:
      return serializeElement(node as Element, indent, newline, depth)
    case Node.TEXT_NODE:
      return pad + escapeText(node.textContent!.trim())
    case Node.CDATA_SECTION_NODE:
      return `${pad}<![CDATA[${node.textContent}]]>`
    case Node.COMMENT_NODE:
      return `${pad}<!--${node.textContent}-->`
    case Node.PROCESSING_INSTRUCTION_NODE: {
      const pi = node as ProcessingInstruction
      return `${pad}<?${pi.target} ${pi.data}?>`
    }
    case Node.DOCUMENT_TYPE_NODE:
      return pad + new XMLSerializer().serializeToString(node)
    default:
      return ''
  }
}

function serialize(input: string, indent: string, newline: string): string {
  const doc = parseXml(input)
  // DOMParser drops the XML declaration, so carry it over from the input.
  const declaration = input.trim().match(/^<\?xml[^?]*\?>/)?.[0]
  const body = Array.from(doc.childNodes)
    .map((node) => serializeNode(node, indent, newline, 0))
    .filter(Boolean)
    .join(newline)
  return declaration ? declaration + newline + body : body
}

export function formatXml(input: string, indent = '  '): string {
  return serialize(input, indent, '\n')
}

export function minifyXml(input: string): string {
  return serialize(input, '', '')
}
