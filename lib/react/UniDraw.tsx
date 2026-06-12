import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import type { CSSProperties } from 'react'
import { UniDraw as UniDrawCore } from '../UniDraw'
import type { UniDrawOptions } from '../UniDraw'
import type { EdgeData, GraphData, NodeData } from '../shared/types'

// ─── Public props / ref types ──────────────────────────────────────────────

export interface UniDrawProps extends Omit<UniDrawOptions, 'initialData' | 'onReady' | 'onAiGenerate' | 'onSelectionChange' | 'onDataChange'> {
  value?: GraphData
  onReady?: () => void
  onSelectionChange?: (nodes: NodeData[], edges: EdgeData[]) => void
  onChange?: (data: GraphData) => void
  style?: CSSProperties
  className?: string
}

export interface UniDrawRef {
  getData: () => GraphData | undefined
  setData: (data: GraphData) => void
  clear: () => void
  exportPNG: () => Promise<string | undefined>
  exportSVG: () => Promise<string | undefined>
  exportJSON: () => string | undefined
  openTemplatePanel: () => void
  undo: () => void
  redo: () => void
  zoomIn: () => void
  zoomOut: () => void
  zoomFit: () => void
  selectAll: () => void
  deleteSelection: () => void
}

// ─── Component ─────────────────────────────────────────────────────────────

const UniDraw = forwardRef<UniDrawRef, UniDrawProps>((props, ref) => {
  const {
    value,
    onReady,
    onSelectionChange,
    onChange,
    style,
    className,
    ...opts
  } = props

  const containerRef = useRef<HTMLDivElement>(null)
  const instanceRef = useRef<UniDrawCore | null>(null)

  useEffect(() => {
    if (!containerRef.current)
      return
    const inst = new UniDrawCore(containerRef.current, {
      ...opts,
      initialData: value,
      onReady,
      onSelectionChange,
      onDataChange: onChange,
    })
    instanceRef.current = inst
    return () => { inst.destroy(); instanceRef.current = null }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync external value changes
  useEffect(() => {
    if (value && instanceRef.current)
      instanceRef.current.setData(value)
  }, [value])

  useEffect(() => {
    if (instanceRef.current && props.assets)
      instanceRef.current.setAssets(props.assets)
  }, [props.assets])

  useEffect(() => {
    instanceRef.current?.setAssetPagination({
      assetPage: props.assetPage,
      assetTotalPages: props.assetTotalPages,
      assetPageLoading: props.assetPageLoading,
      canPrevAssets: props.canPrevAssets,
      canNextAssets: props.canNextAssets,
      onAssetsPrevPage: props.onAssetsPrevPage,
      onAssetsNextPage: props.onAssetsNextPage,
    })
  }, [
    props.assetPage,
    props.assetTotalPages,
    props.assetPageLoading,
    props.canPrevAssets,
    props.canNextAssets,
    props.onAssetsPrevPage,
    props.onAssetsNextPage,
  ])

  useEffect(() => {
    if (instanceRef.current && props.templates)
      instanceRef.current.setTemplates(props.templates)
  }, [props.templates])

  useImperativeHandle(ref, () => ({
    getData: () => instanceRef.current?.getData(),
    setData: d => instanceRef.current?.setData(d),
    clear: () => instanceRef.current?.clear(),
    exportPNG: () => instanceRef.current?.exportPNG() ?? Promise.resolve(undefined),
    exportSVG: () => instanceRef.current?.exportSVG() ?? Promise.resolve(undefined),
    exportJSON: () => instanceRef.current?.exportJSON(),
    openTemplatePanel: () => instanceRef.current?.openTemplatePanel(),
    undo: () => instanceRef.current?.undo(),
    redo: () => instanceRef.current?.redo(),
    zoomIn: () => instanceRef.current?.zoomIn(),
    zoomOut: () => instanceRef.current?.zoomOut(),
    zoomFit: () => instanceRef.current?.zoomFit(),
    selectAll: () => instanceRef.current?.selectAll(),
    deleteSelection: () => instanceRef.current?.deleteSelection(),
  }))

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height: '100%', overflow: 'hidden', ...style }}
    />
  )
})

export default UniDraw
