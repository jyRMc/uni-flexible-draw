import { ref } from 'vue'
import { getSketchRenderer, ROUGHNESS, type SketchRenderOptions } from '@uni-draw/core'
import { isShapeRxSupported } from '@uni-draw/shared'

const SKETCH_TEXT_FONT_FAMILY = '"Excalifont", "Xiaolai SC", "Virgil", cursive'
const SKETCH_EXCALIFONT_STYLE_ID = 'uni-draw-sketch-excalifont-fonts'
const SKETCH_XIAOLAI_LINK_ID = 'uni-draw-sketch-xiaolai-fonts'
const EXCALIFONT_FONT_FACE_CSS = `
@font-face {
  font-family: "Excalifont";
  src: url("https://cdn.jsdelivr.net/gh/excalidraw/excalidraw@master/packages/excalidraw/fonts/Excalifont/Excalifont-Regular-a88b72a24fb54c9f94e3b5fdaa7481c9.woff2") format("woff2"), url("https://raw.githubusercontent.com/excalidraw/excalidraw/master/packages/excalidraw/fonts/Excalifont/Excalifont-Regular-a88b72a24fb54c9f94e3b5fdaa7481c9.woff2") format("woff2");
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  unicode-range: U+20-7e,U+a0-a3,U+a5-a6,U+a8-ab,U+ad-b1,U+b4,U+b6-b8,U+ba-ff,U+131,U+152-153,U+2bc,U+2c6,U+2da,U+2dc,U+304,U+308,U+2013-2014,U+2018-201a,U+201c-201e,U+2020,U+2022,U+2024-2026,U+2030,U+2039-203a,U+20ac,U+2122,U+2212;
}
@font-face {
  font-family: "Excalifont";
  src: url("https://cdn.jsdelivr.net/gh/excalidraw/excalidraw@master/packages/excalidraw/fonts/Excalifont/Excalifont-Regular-be310b9bcd4f1a43f571c46df7809174.woff2") format("woff2"), url("https://raw.githubusercontent.com/excalidraw/excalidraw/master/packages/excalidraw/fonts/Excalifont/Excalifont-Regular-be310b9bcd4f1a43f571c46df7809174.woff2") format("woff2");
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  unicode-range: U+100-130,U+132-137,U+139-149,U+14c-151,U+154-17e,U+192,U+1fc-1ff,U+218-21b,U+237,U+1e80-1e85,U+1ef2-1ef3,U+2113;
}
@font-face {
  font-family: "Excalifont";
  src: url("https://cdn.jsdelivr.net/gh/excalidraw/excalidraw@master/packages/excalidraw/fonts/Excalifont/Excalifont-Regular-b9dcf9d2e50a1eaf42fc664b50a3fd0d.woff2") format("woff2"), url("https://raw.githubusercontent.com/excalidraw/excalidraw/master/packages/excalidraw/fonts/Excalifont/Excalifont-Regular-b9dcf9d2e50a1eaf42fc664b50a3fd0d.woff2") format("woff2");
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  unicode-range: U+400-45f,U+490-491,U+2116;
}
@font-face {
  font-family: "Excalifont";
  src: url("https://cdn.jsdelivr.net/gh/excalidraw/excalidraw@master/packages/excalidraw/fonts/Excalifont/Excalifont-Regular-41b173a47b57366892116a575a43e2b6.woff2") format("woff2"), url("https://raw.githubusercontent.com/excalidraw/excalidraw/master/packages/excalidraw/fonts/Excalifont/Excalifont-Regular-41b173a47b57366892116a575a43e2b6.woff2") format("woff2");
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  unicode-range: U+37e,U+384-38a,U+38c,U+38e-393,U+395-3a1,U+3a3-3a8,U+3aa-3cf,U+3d7;
}
@font-face {
  font-family: "Excalifont";
  src: url("https://cdn.jsdelivr.net/gh/excalidraw/excalidraw@master/packages/excalidraw/fonts/Excalifont/Excalifont-Regular-3f2c5db56cc93c5a6873b1361d730c16.woff2") format("woff2"), url("https://raw.githubusercontent.com/excalidraw/excalidraw/master/packages/excalidraw/fonts/Excalifont/Excalifont-Regular-3f2c5db56cc93c5a6873b1361d730c16.woff2") format("woff2");
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  unicode-range: U+2c7,U+2d8-2d9,U+2db,U+2dd,U+302,U+306-307,U+30a-30c,U+326-328,U+212e,U+2211,U+fb01-fb02;
}
@font-face {
  font-family: "Excalifont";
  src: url("https://cdn.jsdelivr.net/gh/excalidraw/excalidraw@master/packages/excalidraw/fonts/Excalifont/Excalifont-Regular-349fac6ca4700ffec595a7150a0d1e1d.woff2") format("woff2"), url("https://raw.githubusercontent.com/excalidraw/excalidraw/master/packages/excalidraw/fonts/Excalifont/Excalifont-Regular-349fac6ca4700ffec595a7150a0d1e1d.woff2") format("woff2");
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  unicode-range: U+462-463,U+472-475,U+4d8-4d9,U+4e2-4e3,U+4e6-4e9,U+4ee-4ef;
}
@font-face {
  font-family: "Excalifont";
  src: url("https://cdn.jsdelivr.net/gh/excalidraw/excalidraw@master/packages/excalidraw/fonts/Excalifont/Excalifont-Regular-623ccf21b21ef6b3a0d87738f77eb071.woff2") format("woff2"), url("https://raw.githubusercontent.com/excalidraw/excalidraw/master/packages/excalidraw/fonts/Excalifont/Excalifont-Regular-623ccf21b21ef6b3a0d87738f77eb071.woff2") format("woff2");
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  unicode-range: U+300-301,U+303;
}
@font-face {
  font-family: "Virgil";
  src: url("https://cdn.jsdelivr.net/gh/excalidraw/excalidraw@master/packages/excalidraw/fonts/Virgil/Virgil-Regular.woff2") format("woff2"), url("https://raw.githubusercontent.com/excalidraw/excalidraw/master/packages/excalidraw/fonts/Virgil/Virgil-Regular.woff2") format("woff2");
  font-style: normal;
  font-weight: 400;
  font-display: swap;
}
`

function ensureSketchTextFontsLoaded() {
  if (typeof document === 'undefined') return

  if (!document.getElementById(SKETCH_EXCALIFONT_STYLE_ID)) {
    const style = document.createElement('style')
    style.id = SKETCH_EXCALIFONT_STYLE_ID
    style.textContent = EXCALIFONT_FONT_FACE_CSS
    document.head.appendChild(style)
  }

  if (!document.getElementById(SKETCH_XIAOLAI_LINK_ID)) {
    const link = document.createElement('link')
    link.id = SKETCH_XIAOLAI_LINK_ID
    link.rel = 'stylesheet'
    link.href = 'https://cdn.jsdelivr.net/npm/@chinese-fonts/xiaolai@3.0.0/dist/Xiaolai/result.css'
    link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
  }
}

function getSketchTextAttrs(attrs: Record<string, any> | undefined) {
  return {
    ...(attrs ?? {}),
    fontFamily: SKETCH_TEXT_FONT_FAMILY,
  }
}

export function useSketch(getGraph: () => any) {
  const sketchMode = ref(false)
  const sketchElementIds = ref(new Set<string>())
  const sketchAllMode = ref(false)

  const seedMap = new Map<string, number>()
  const originalMarkupMap = new Map<string, any>()
  const originalAttrsMap = new Map<string, any>()
  let sketchRedrawing = false

  function getSeed(id: string): number {
    if (!seedMap.has(id)) {
      seedMap.set(id, Math.abs(hashStr(id)) || 1)
    }
    return seedMap.get(id)!
  }

  function hashStr(s: string): number {
    let h = 0
    for (let i = 0; i < s.length; i++) {
      h = ((h << 5) - h + s.charCodeAt(i)) | 0
    }
    return Math.abs(h) || 1
  }

  function markSketchElementIds() {
    sketchElementIds.value = new Set(sketchElementIds.value)
  }

  function isSketchUnsupportedNode(node: any): boolean {
    return node?.shape === 'basic-image' || node?.shape === 'basic-svg' || node?.shape === 'basic-table'
  }

  function parseRefPoints(refPoints: string, width: number, height: number): [number, number][] {
    const pairs = refPoints.trim().split(/\s+/)
    return pairs.map(pair => {
      const [xStr, yStr] = pair.split(',')
      let x = parseFloat(xStr)
      let y = parseFloat(yStr)
      if (x <= 1 && y <= 1) {
        x = x * width
        y = y * height
      }
      return [x, y] as [number, number]
    })
  }

  function applySketchToNode(node: any) {
    const graph = getGraph()
    if (!graph) return
    if (isSketchUnsupportedNode(node)) return
    ;(graph as any).disableHistory?.()
    ensureSketchTextFontsLoaded()

    const renderer = getSketchRenderer()
    const size = node.getSize()
    if (!originalAttrsMap.has(node.id)) {
      originalAttrsMap.set(node.id, JSON.parse(JSON.stringify(node.getAttrs?.() ?? {})))
    }
    const attrs = node.getAttrs?.() ?? {}
    const body = attrs.body ?? {}

    const stroke = body.stroke ?? '#333'
    const fill = body.fill ?? '#fff'
    const strokeWidth = body.strokeWidth ?? 2
    const shapeName = node.shape ?? ''
    const rxSupported = isShapeRxSupported(shapeName)
    const rx = rxSupported ? (body.rx ?? 0) : 0
    const strokeDasharray = body.strokeDasharray as string | undefined
    const refPoints = body.refPoints as string | undefined

    const opts: SketchRenderOptions = {
      stroke,
      fill: fill === 'none' || fill === 'transparent' ? undefined : String(fill),
      strokeWidth: Math.max(strokeWidth, 1),
      fillStyle: 'solid',
      fillWeight: strokeWidth / 2,
      hachureGap: strokeWidth * 4,
      seed: getSeed(node.id),
      roughness: ROUGHNESS.artist,
    }
    if (strokeDasharray) {
      const parts = strokeDasharray.split(/\s+/).map(Number)
      if (parts.length >= 2 && parts[0] <= 3) {
        opts.strokeLineDash = [1.5, 6 + strokeWidth]
        opts.disableMultiStroke = true
      } else if (parts.length >= 2) {
        opts.strokeLineDash = [8, 8 + strokeWidth]
        opts.disableMultiStroke = true
      }
    }

    let d: string
    if (refPoints) {
      const points = parseRefPoints(refPoints, size.width, size.height)
      d = renderer.polygon(points, size.width, size.height, opts)
    } else if (!rxSupported) {
      if (!originalMarkupMap.has(node.id)) {
        originalMarkupMap.set(node.id, node.getMarkup())
      }
      const origMarkup = originalMarkupMap.get(node.id) ?? node.getMarkup()
      const bodyMarkup = (origMarkup as any[]).find((m: any) => m.selector === 'body')
      const bodyTag = bodyMarkup?.tagName ?? 'rect'

      if (bodyTag === 'ellipse' || bodyTag === 'circle') {
        d = renderer.ellipse(size.width, size.height, opts)
      } else {
        d = renderer.rect(size.width, size.height, 0, opts)
      }
    } else {
      d = renderer.rect(size.width, size.height, rx, opts)
    }

    if (!originalMarkupMap.has(node.id)) {
      originalMarkupMap.set(node.id, node.getMarkup())
    }
    const origMarkup = originalMarkupMap.get(node.id) ?? node.getMarkup()
    const sketchMarkup = (origMarkup as any[]).map((m: any) => {
      if (m.selector === 'body' && m.tagName !== 'path') {
        return { ...m, tagName: 'path' }
      }
      return m
    })

    const sketchBodyAttrs: any = {
      d,
      stroke,
      strokeWidth,
      fill: fill === 'none' || fill === 'transparent' ? 'none' : fill,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    }
    if (strokeDasharray) {
      sketchBodyAttrs.strokeDasharray = strokeDasharray
    }

    const sketchAttrs: any = {
      body: sketchBodyAttrs,
      label: getSketchTextAttrs(attrs.label),
    }

    node.setMarkup(sketchMarkup)
    node.setAttrs(sketchAttrs)
    ;(getGraph() as any)?.enableHistory?.()
  }

  function applySketchToEdge(edge: any) {
    const graph = getGraph()
    if (!graph) return
    ;(graph as any).disableHistory?.()
    ensureSketchTextFontsLoaded()

    let points: { x: number; y: number }[] = []
    const view = (graph as any).findView?.(edge)
    if (view) {
      const pathEl = (view.container as Element)?.querySelector('[connection]') as SVGPathElement | null
      const d = pathEl?.getAttribute('d')
      if (d) {
        const re = /[ML]\s*([-.\deE]+)[,\s]+([-.\deE]+)/g
        let m: RegExpExecArray | null
        while ((m = re.exec(d)) !== null) {
          points.push({ x: parseFloat(m[1]), y: parseFloat(m[2]) })
        }
      }
    }
    if (points.length < 2) {
      const sourcePoint = edge.getSourcePoint?.()
      const targetPoint = edge.getTargetPoint?.()
      const vertices = edge.getVertices?.() ?? []
      if (!sourcePoint || !targetPoint) return
      points = [
        { x: sourcePoint.x, y: sourcePoint.y },
        ...vertices.map((v: any) => ({ x: v.x, y: v.y })),
        { x: targetPoint.x, y: targetPoint.y },
      ]
    }

    if (!originalAttrsMap.has(edge.id)) {
      originalAttrsMap.set(edge.id, JSON.parse(JSON.stringify(edge.getAttrs?.() ?? {})))
    }
    const attrs = edge.getAttrs?.() ?? {}
    const line = attrs.line ?? {}

    const stroke = line.stroke ?? '#333'
    const strokeWidth = line.strokeWidth ?? 2
    const strokeDasharray = line.strokeDasharray as string | undefined

    const renderer = getSketchRenderer()
    const opts: SketchRenderOptions = {
      stroke,
      strokeWidth: Math.max(strokeWidth, 1),
      seed: getSeed(edge.id),
      roughness: ROUGHNESS.artist,
      preserveVertices: true,
    }
    if (strokeDasharray) {
      const parts = strokeDasharray.split(/\s+/).map(Number)
      if (parts.length >= 2 && parts[0] <= 3) {
        opts.strokeLineDash = [1.5, 6 + strokeWidth]
        opts.disableMultiStroke = true
      } else {
        opts.strokeLineDash = [8, 8 + strokeWidth]
        opts.disableMultiStroke = true
      }
    }

    const connector = edge.getConnector?.()
    let d: string
    if (connector?.name === 'smooth' && points.length >= 3) {
      d = renderer.curve(points, opts)
    } else {
      d = renderer.linearPath(points, opts)
    }

    const sketchAttrs: any = {
      line: {
        d,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      },
    }
    for (const key of Object.keys(attrs)) {
      if (key.includes('label')) {
        sketchAttrs[key] = getSketchTextAttrs(attrs[key])
      }
    }

    edge.setAttrs(sketchAttrs)
    ;(getGraph() as any)?.enableHistory?.()
  }

  function resetSketchFromElement(cell: any) {
    ;(getGraph() as any)?.disableHistory?.()
    if (cell.isNode?.()) {
      const origMarkup = originalMarkupMap.get(cell.id)
      if (origMarkup) cell.setMarkup(origMarkup)
      const origAttrs = originalAttrsMap.get(cell.id)
      if (origAttrs) cell.setAttrs(JSON.parse(JSON.stringify(origAttrs)), { overwrite: true })
      originalMarkupMap.delete(cell.id)
      originalAttrsMap.delete(cell.id)
    } else if (cell.isEdge?.()) {
      const origAttrs = originalAttrsMap.get(cell.id)
      if (origAttrs) cell.setAttrs(JSON.parse(JSON.stringify(origAttrs)), { overwrite: true })
      originalAttrsMap.delete(cell.id)
    }
    ;(getGraph() as any)?.enableHistory?.()
  }

  function toggleSketchMode(): boolean {
    sketchMode.value = !sketchMode.value
    sketchAllMode.value = sketchMode.value
    const graph = getGraph()
    if (!graph) return sketchMode.value

    if (sketchMode.value) {
      graph.getNodes().forEach((n: any) => {
        if (isSketchUnsupportedNode(n)) return
        if (!sketchElementIds.value.has(n.id)) {
          sketchElementIds.value.add(n.id)
          applySketchToNode(n)
        }
      })
      graph.getEdges().forEach((e: any) => {
        if (!sketchElementIds.value.has(e.id)) {
          sketchElementIds.value.add(e.id)
          applySketchToEdge(e)
        }
      })
    } else {
      graph.getNodes().forEach((n: any) => {
        if (sketchElementIds.value.has(n.id)) resetSketchFromElement(n)
      })
      graph.getEdges().forEach((e: any) => {
        if (sketchElementIds.value.has(e.id)) resetSketchFromElement(e)
      })
      sketchElementIds.value.clear()
    }
    markSketchElementIds()
    return sketchMode.value
  }

  function toggleElementSketch(id: string): boolean {
    const graph = getGraph()
    if (!graph) return false
    const cell = graph.getCellById(id)
    if (!cell) return false
    if (cell.isNode?.() && isSketchUnsupportedNode(cell)) return false
    sketchAllMode.value = false

    if (sketchElementIds.value.has(id)) {
      sketchElementIds.value.delete(id)
      if (cell.isNode?.()) resetSketchFromElement(cell)
      else if (cell.isEdge?.()) resetSketchFromElement(cell)
      sketchMode.value = sketchElementIds.value.size > 0
    } else {
      sketchElementIds.value.add(id)
      if (cell.isNode?.()) applySketchToNode(cell)
      else if (cell.isEdge?.()) applySketchToEdge(cell)
      sketchMode.value = true
    }
    markSketchElementIds()
    return sketchElementIds.value.has(id)
  }

  function isElementSketch(id: string): boolean {
    return sketchElementIds.value.has(id)
  }

  function applySketchToAll() {
    const graph = getGraph()
    if (!graph) return
    sketchMode.value = true
    sketchAllMode.value = true
    sketchRedrawing = true
    try {
      graph.getNodes().forEach((n: any) => {
        if (isSketchUnsupportedNode(n)) return
        if (!sketchElementIds.value.has(n.id)) {
          sketchElementIds.value.add(n.id)
          applySketchToNode(n)
        }
      })
      graph.getEdges().forEach((e: any) => {
        if (!sketchElementIds.value.has(e.id)) {
          sketchElementIds.value.add(e.id)
          applySketchToEdge(e)
        }
      })
    } finally { sketchRedrawing = false }
    markSketchElementIds()
  }

  function resetSketchFromAll() {
    const graph = getGraph()
    if (!graph) return
    graph.getNodes().forEach((n: any) => {
      if (sketchElementIds.value.has(n.id)) resetSketchFromElement(n)
    })
    graph.getEdges().forEach((e: any) => {
      if (sketchElementIds.value.has(e.id)) resetSketchFromElement(e)
    })
    sketchElementIds.value.clear()
    sketchMode.value = false
    sketchAllMode.value = false
    markSketchElementIds()
  }

  function onSketchNodeAdded({ node }: any) {
    if (!sketchAllMode.value || isSketchUnsupportedNode(node) || sketchElementIds.value.has(node.id)) return
    sketchElementIds.value.add(node.id)
    sketchRedrawing = true
    try { applySketchToNode(node) } finally { sketchRedrawing = false }
    markSketchElementIds()
  }

  function onSketchEdgeAdded({ edge }: any) {
    if (!sketchAllMode.value || sketchElementIds.value.has(edge.id)) return
    sketchElementIds.value.add(edge.id)
    sketchRedrawing = true
    try { applySketchToEdge(edge) } finally { sketchRedrawing = false }
    markSketchElementIds()
  }

  function onSketchNodeChange({ node }: any) {
    if (isSketchUnsupportedNode(node)) return
    if (sketchRedrawing || !sketchElementIds.value.has(node.id)) return
    sketchRedrawing = true
    try { applySketchToNode(node) } finally { sketchRedrawing = false }
  }

  function onSketchNodeAttrsChange({ node }: any) {
    if (isSketchUnsupportedNode(node)) return
    if (sketchRedrawing || !sketchElementIds.value.has(node.id)) return
    sketchRedrawing = true
    try { applySketchToNode(node) } finally { sketchRedrawing = false }
  }

  function onSketchEdgeChange({ edge }: any) {
    if (sketchRedrawing || !sketchElementIds.value.has(edge.id)) return
    sketchRedrawing = true
    try { applySketchToEdge(edge) } finally { sketchRedrawing = false }
  }

  return {
    sketchMode,
    sketchElementIds,
    toggleSketchMode,
    toggleElementSketch,
    isElementSketch,
    applySketchToAll,
    resetSketchFromAll,
    onSketchNodeAdded,
    onSketchEdgeAdded,
    onSketchNodeChange,
    onSketchNodeAttrsChange,
    onSketchEdgeChange,
  }
}
