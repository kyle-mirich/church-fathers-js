// Text selection utilities for note-taking functionality

export interface TextSelection {
  text: string
  startOffset: number
  endOffset: number
  elementId?: string
  xpath?: string
  range?: Range
}

export interface HighlightData {
  id?: string
  text: string
  startOffset: number
  endOffset: number
  color: string
  elementId?: string
  xpath?: string
}

// Generate a unique session ID for anonymous users
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Get or create session ID
export function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  
  let sessionId = localStorage.getItem('orthodox-reader-session')
  if (!sessionId) {
    sessionId = generateSessionId()
    localStorage.setItem('orthodox-reader-session', sessionId)
  }
  return sessionId
}

// Get current text selection
export function getCurrentSelection(): TextSelection | null {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    return null
  }

  const range = selection.getRangeAt(0)
  const text = selection.toString().trim()
  
  if (!text) return null

  // Find the closest element with an ID
  let element: Node | null = range.commonAncestorContainer
  while (element && element.nodeType === Node.TEXT_NODE) {
    element = element.parentNode
  }
  
  const elementWithId = element ? findElementWithId(element as Element) : null
  const elementId = elementWithId?.id

  // Calculate relative offsets within the container
  const container = elementWithId || element
  const startOffset = getTextOffset(container as Element, range.startContainer, range.startOffset)
  const endOffset = getTextOffset(container as Element, range.endContainer, range.endOffset)

  return {
    text,
    startOffset,
    endOffset,
    elementId,
    xpath: generateXPath(range.commonAncestorContainer),
    range
  }
}

// Find the closest element with an ID
function findElementWithId(element: Element | Node | null): Element | null {
  while (element && element.nodeType === Node.ELEMENT_NODE) {
    const el = element as Element
    if (el.id) return el
    element = el.parentElement
  }
  return null
}

// Calculate text offset within a container
function getTextOffset(container: Element, node: Node, offset: number): number {
  let textOffset = 0
  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    null
  )

  let currentNode = walker.nextNode()
  while (currentNode && currentNode !== node) {
    textOffset += currentNode.textContent?.length || 0
    currentNode = walker.nextNode()
  }

  return textOffset + offset
}

// Generate XPath for a node
function generateXPath(node: Node): string {
  if (node.nodeType === Node.DOCUMENT_NODE) return ''
  
  let element = node.nodeType === Node.ELEMENT_NODE ? node as Element : node.parentElement
  if (!element) return ''

  const parts: string[] = []
  
  while (element && element.nodeType === Node.ELEMENT_NODE) {
    let index = 1
    let sibling = element.previousElementSibling
    
    while (sibling) {
      if (sibling.tagName === element.tagName) {
        index++
      }
      sibling = sibling.previousElementSibling
    }
    
    const tagName = element.tagName.toLowerCase()
    const part = index > 1 ? `${tagName}[${index}]` : tagName
    parts.unshift(part)
    
    element = element.parentElement
  }
  
  return '/' + parts.join('/')
}

// Create a range from stored selection data
export function createRangeFromSelection(container: Element, selection: TextSelection): Range | null {
  try {
    const range = document.createRange()
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      null
    )

    let currentOffset = 0
    let startNode: Node | null = null
    let endNode: Node | null = null
    let startNodeOffset = 0
    let endNodeOffset = 0

    let textNode = walker.nextNode()
    while (textNode) {
      const nodeLength = textNode.textContent?.length || 0
      
      // Check if start position is in this node
      if (!startNode && currentOffset + nodeLength >= selection.startOffset) {
        startNode = textNode
        startNodeOffset = selection.startOffset - currentOffset
      }
      
      // Check if end position is in this node
      if (!endNode && currentOffset + nodeLength >= selection.endOffset) {
        endNode = textNode
        endNodeOffset = selection.endOffset - currentOffset
        break
      }
      
      currentOffset += nodeLength
      textNode = walker.nextNode()
    }

    if (startNode && endNode) {
      range.setStart(startNode, startNodeOffset)
      range.setEnd(endNode, endNodeOffset)
      return range
    }
  } catch (error) {
    console.error('Error creating range from selection:', error)
  }
  
  return null
}

// Apply highlight to a text selection
export function applyHighlight(container: Element, highlight: HighlightData): void {
  const range = createRangeFromSelection(container, {
    text: highlight.text,
    startOffset: highlight.startOffset,
    endOffset: highlight.endOffset,
    elementId: highlight.elementId,
    xpath: highlight.xpath
  })

  if (!range) return

  try {
    // Create highlight span
    const highlightSpan = document.createElement('span')
    highlightSpan.className = `highlight highlight-${highlight.color.toLowerCase()}`
    highlightSpan.dataset.highlightId = highlight.id || ''
    highlightSpan.dataset.highlightColor = highlight.color
    highlightSpan.style.backgroundColor = getHighlightColorValue(highlight.color)
    highlightSpan.style.padding = '2px 1px'
    highlightSpan.style.borderRadius = '2px'
    highlightSpan.style.cursor = 'pointer'

    // Wrap the selected content
    try {
      range.surroundContents(highlightSpan)
    } catch (e) {
      // If surroundContents fails, extract and append the contents
      const contents = range.extractContents()
      highlightSpan.appendChild(contents)
      range.insertNode(highlightSpan)
    }
  } catch (error) {
    console.error('Error applying highlight:', error)
  }
}

// Remove highlight
export function removeHighlight(highlightId: string): void {
  const highlightElement = document.querySelector(`[data-highlight-id="${highlightId}"]`)
  if (highlightElement) {
    const parent = highlightElement.parentNode
    if (parent) {
      // Move all child nodes to parent and remove the highlight element
      while (highlightElement.firstChild) {
        parent.insertBefore(highlightElement.firstChild, highlightElement)
      }
      parent.removeChild(highlightElement)
      
      // Normalize the text nodes
      parent.normalize()
    }
  }
}

// Get highlight color CSS value
function getHighlightColorValue(color: string): string {
  const colors: { [key: string]: string } = {
    YELLOW: '#fef08a',
    BLUE: '#bfdbfe', 
    GREEN: '#bbf7d0',
    PINK: '#fce7f3',
    ORANGE: '#fed7aa',
    PURPLE: '#e9d5ff',
    RED: '#fecaca'
  }
  return colors[color] || colors.YELLOW
}

// Clear current selection
export function clearSelection(): void {
  const selection = window.getSelection()
  if (selection) {
    selection.removeAllRanges()
  }
}