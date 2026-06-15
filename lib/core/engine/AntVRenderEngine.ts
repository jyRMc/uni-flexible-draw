import { Graph, Registry } from '@antv/x6'
import { History } from '@antv/x6-plugin-history'
import { Selection } from '@antv/x6-plugin-selection'
import { Transform } from '@antv/x6-plugin-transform'
import { Export } from '@antv/x6-plugin-export'
import type { CanvasConfig } from '@uni-draw/shared'
import { PRIMARY_COLOR } from '@uni-draw/shared'
import { buildMultiRegionAttrs } from '../../shapes/utils/regionNodes'
import { highlightEdge, unhighlightEdge } from '../graph/highlight'

export interface AntVRenderEngineOptions {
  canvasConfig?: CanvasConfig
  readonly?: boolean
  grid?: boolean
  snapline?: boolean
  keyboard?: boolean
  minimap?: boolean
  rotateHandlePath?: string
}

/**
 * AntV X6 渲染引擎封装
 * 负责 Graph 实例的创建、配置与销毁
 */
export class AntVRenderEngine {
  private graph: Graph | null = null
  private container: HTMLElement | null = null
  private resizeObserver: ResizeObserver | null = null

  /**
   * 初始化画布
   */
  init(container: HTMLElement, options: AntVRenderEngineOptions = {}): Graph {
    this.container = container

    // 容器尺寸防护（防止 autoResize 无限撑高）
    container.style.position = 'relative'
    container.style.overflow = 'hidden'
    container.style.width = '100%'
    container.style.height = '100%'

    const canvasConfig = options.canvasConfig || {}

    this.graph = new Graph({
      container,
      width: container.clientWidth || 800,
      height: container.clientHeight || 600,
      autoResize: true,
      panning: {
        enabled: !options.readonly,
        eventTypes: ['rightMouseDown', 'mouseWheelDown'],
      },
      mousewheel: {
        enabled: !options.readonly,
        modifiers: ['ctrl', 'meta'],
      },
      background: canvasConfig.backgroundColor
        ? { color: canvasConfig.backgroundColor }
        : undefined,
      grid: options.grid !== false
        ? {
            size: canvasConfig.grid?.size ?? 10,
            visible: canvasConfig.grid?.visible ?? true,
            type: canvasConfig.grid?.type ?? 'dot',
            args: canvasConfig.grid?.color
              ? { color: canvasConfig.grid.color }
              : undefined,
          }
        : undefined,
      interacting: options.readonly
        ? { nodeMovable: false, edgeMovable: false, arrowheadMovable: false }
        : (cellView: any) => {
            const cell = cellView.cell
            const isLocked = cell?.getData?.()?.locked === true
            if (cell?.isEdge?.()) {
              return {
                edgeMovable: !isLocked,
                edgeLabelMovable: !isLocked,
                vertexAddable: !isLocked,
                vertexMovable: !isLocked,
                vertexDeletable: !isLocked,
                arrowheadMovable: !isLocked,
              }
            }
            return {
              nodeMovable: !isLocked,
              magnetConnectable: !isLocked,
            }
          },
      embedding: {
        enabled: true,
        findParent({ node }) {
          const bbox = node.getBBox()
          const graph = (node as any).model?.graph
          if (!graph) {
            return []
          }
          return graph.getNodes().filter((n: any) => {
            if (n.id === node.id) {
              return false
            }
            if (n.shape !== 'basic-group') {
              return false
            }
            const parentBBox = n.getBBox()
            return bbox.intersectsWithRect(parentBBox) || parentBBox.containsRect(bbox)
          })
        },
      },
      connecting: {
        allowBlank: true,
        allowMulti: true,
        allowLoop: false,
        highlight: true,
        snap: true,
        validateMagnet({ magnet }) {
          return magnet.getAttribute('magnet') === 'true'
        },
        createEdge() {
          return this.createEdge({
            shape: 'edge-line',
            attrs: {
              line: {
                sourceMarker: null,
                targetMarker: null,
              },
            },
          })
        },
      },
    })

    // X6 没有内置 'open' 箭头，基于 block 注册一个空心箭头
    if (!Registry.Marker.registry.get('open')) {
      Graph.registerMarker('open', (options: any) => {
        return Registry.Marker.presets.block({ ...options, open: true })
      })
    }

    // 安装 Selection 插件（点击/框选节点和边）
    // 只监听左键，避免中键拖动画布时被识别为框选
    // rubberEdge 开启后框选可包含连接线
    this.graph.use(
      new Selection({
        enabled: !options.readonly,
        multiple: true,
        rubberband: !options.readonly,
        rubberEdge: !options.readonly,
        movable: !options.readonly,
        showNodeSelectionBox: !options.readonly,
        showEdgeSelectionBox: false,
        selectEdgeOnMoved: !options.readonly,
        eventTypes: ['leftMouseDown'],
      }),
    )

    // 安装 History 插件（撤销/重做）
    this.graph.use(new History({ enabled: true }))

    // 安装 Export 插件（导出 PNG/SVG）
    this.graph.use(new Export())

    // 安装 Transform 插件（缩放/旋转），只读模式下不安装
    if (!options.readonly) {
      this.graph.use(
        new Transform({
          resizing: {
            enabled: node => node.getData()?.locked !== true,
            orthogonal: false,
            preserveAspectRatio: false,
          },
          rotating: {
            enabled: node => node.getData()?.locked !== true,
          },
        }),
      )
    }

    // 注入旋转控制柄自定义图标
    this.injectRotateHandleStyle(options.rotateHandlePath)

    // 监听容器尺寸变化
    this.resizeObserver = new ResizeObserver(() => {
      if (this.graph && this.container) {
        this.graph.resize(this.container.clientWidth, this.container.clientHeight)
      }
    })
    this.resizeObserver.observe(container)

    // 设置初始缩放和偏移
    if (canvasConfig.zoom) {
      this.graph.zoomTo(canvasConfig.zoom)
    }
    if (canvasConfig.offset) {
      this.graph.translate(canvasConfig.offset.x, canvasConfig.offset.y)
    }

    // 悬停节点时显示/隐藏连接桩 + 删除按钮（只读模式不启用）
    if (!options.readonly) {
      const isEdgeToolElement = (target: EventTarget | null) => {
        return target instanceof Element && !!target.closest(
          '.x6-edge-tool-segments, .x6-edge-tool-segment, .x6-edge-tool-source-arrowhead, .x6-edge-tool-target-arrowhead, .x6-tool',
        )
      }

      let dividerDragState: { node: any, dividerIndex: number, startY: number, startPositions: number[], containerHeight: number } | null = null

      this.graph.on('node:mouseenter', ({ node, view }: any) => {
        const ports = view.container.querySelectorAll('.x6-port-body') as NodeListOf<SVGElement>
        ports.forEach((el) => {
          el.style.visibility = 'visible'
        })
        node.setTools([])
        const dividers = view.container.querySelectorAll('[data-selector^="divider"]') as NodeListOf<SVGElement>
        dividers.forEach((el) => {
          el.style.cursor = 'ns-resize'
        })
      })
      this.graph.on('node:mouseleave', ({ node, view }: any) => {
        const ports = view.container.querySelectorAll('.x6-port-body') as NodeListOf<SVGElement>
        ports.forEach((el) => {
          el.style.visibility = 'hidden'
        })
        node.removeTools()
        const dividers = view.container.querySelectorAll('[data-selector^="divider"]') as NodeListOf<SVGElement>
        dividers.forEach((el) => {
          el.style.cursor = ''
        })
      })

      // 分隔线拖动
      this.graph.on('node:mousedown', ({ node, e }: any) => {
        const selector = (() => {
          let target = e?.target as Element | null
          while (target) {
            const sel = target.getAttribute('data-selector')
            if (sel) {
              return sel
            }
            target = target.parentElement
          }
          return undefined
        })()
        if (!selector || !selector.startsWith('divider')) {
          return
        }
        e.stopPropagation()
        const regionData = node.getData()?.regionData
        if (!regionData || !Array.isArray(regionData.dividers)) {
          return
        }
        const dividerIndex = regionData.dividers.findIndex((d: any) => d.id === selector)
        if (dividerIndex < 0) {
          return
        }
        const size = node.getSize()
        dividerDragState = {
          node,
          dividerIndex,
          startY: e.clientY,
          startPositions: regionData.dividers.map((d: any) => d.position),
          containerHeight: size.height,
        }

        const onMouseMove = (ev: MouseEvent) => {
          if (!dividerDragState) {
            return
          }
          const { node, dividerIndex, startY, startPositions, containerHeight } = dividerDragState
          const deltaY = (ev.clientY - startY) / containerHeight
          let newPos = startPositions[dividerIndex] + deltaY
          const prev = dividerIndex > 0 ? startPositions[dividerIndex - 1] + deltaY : 0.05
          const next = dividerIndex < startPositions.length - 1 ? startPositions[dividerIndex + 1] + deltaY : 0.95
          newPos = Math.max(prev + 0.05, Math.min(next - 0.05, newPos))
          newPos = Math.max(0.05, Math.min(0.95, newPos))

          const data = node.getData() as any
          const nextDividers = [...data.regionData.dividers]
          nextDividers[dividerIndex] = { ...nextDividers[dividerIndex], position: newPos }
          const nextRegionData = { ...data.regionData, dividers: nextDividers }
          node.setData({ ...data, regionData: nextRegionData })

          const regionAttrs = buildMultiRegionAttrs(node.shape, nextRegionData)
          if (regionAttrs) {
            Object.keys(regionAttrs).forEach((key) => {
              node.setAttrByPath(key, regionAttrs[key])
            })
          }
        }

        const onMouseUp = () => {
          dividerDragState = null
          document.removeEventListener('mousemove', onMouseMove)
          document.removeEventListener('mouseup', onMouseUp)
        }

        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
      })

      // 悬停边时高亮线条并显示顶点/端点手柄
      this.graph.on('edge:mouseenter', ({ edge }: any) => {
        highlightEdge(edge)
        if (edge.shape !== 'edge-sketch') {
          edge.setTools([
            {
              name: 'segments',
              args: {
                threshold: 12,
                snapRadius: 10,
                attrs: {
                  'fill': PRIMARY_COLOR,
                  'stroke': '#fff',
                  'stroke-width': 2,
                  'width': 20,
                  'height': 8,
                  'x': -10,
                  'y': -4,
                  'rx': 4,
                  'ry': 4,
                  'cursor': 'move',
                },
              },
            },
            { name: 'source-arrowhead' },
            { name: 'target-arrowhead' },
          ])
        }
      })
      this.graph.on('edge:mouseleave', ({ edge, e }: any) => {
        const graph = this.graph
        if (!graph)
          return
        if (graph.isSelected?.(edge) || isEdgeToolElement(e?.relatedTarget ?? null))
          return
        unhighlightEdge(edge)
        edge.removeTools()
      })

      // 双击节点：浮层 textarea 内联编辑标签（图片/SVG 节点由 useCanvas 处理）
      this.graph.on('node:dblclick', ({ node, e }: any) => {
        if (node.shape === 'basic-image' || node.shape === 'basic-svg')
          return
        e.stopPropagation()
        e.preventDefault()

        const zoom = this.graph!.zoom()
        const pos = node.getPosition()
        const size = node.getSize()

        // 将图形坐标转换为客户端坐标
        let clientX: number, clientY: number
        if (typeof (this.graph as any).localToClient === 'function') {
          const pt = (this.graph as any).localToClient({ x: pos.x, y: pos.y })
          clientX = pt.x
          clientY = pt.y
        }
        else {
          const { tx, ty } = this.graph!.translate()
          const rect = container.getBoundingClientRect()
          clientX = rect.left + tx + pos.x * zoom
          clientY = rect.top + ty + pos.y * zoom
        }

        const w = size.width * zoom
        const h = size.height * zoom

        const selector = (() => {
          let target = e?.target as Element | null
          while (target) {
            const sel = target.getAttribute('data-selector')
            if (sel) {
              return sel
            }
            target = target.parentElement
          }
          return undefined
        })()
        const regionId = selector ? mapSelectorToRegionId(node.shape, selector) : undefined
        const editor = document.createElement('textarea')
        editor.value = regionId
          ? getRegionLabel(node, regionId)
          : (node.getLabel() as string) ?? ''
        Object.assign(editor.style, {
          position: 'fixed',
          left: `${clientX}px`,
          top: `${clientY}px`,
          width: `${w}px`,
          height: `${h}px`,
          fontSize: `${Math.max(12, 14 * zoom)}px`,
          lineHeight: '1.4',
          textAlign: 'center',
          border: `2px solid ${PRIMARY_COLOR}`,
          borderRadius: '4px',
          background: 'rgba(255,255,255,0.96)',
          padding: `${Math.max(4, (h - 20 * zoom) / 2)}px 6px`,
          outline: 'none',
          resize: 'none',
          overflow: 'hidden',
          zIndex: '9999',
          boxSizing: 'border-box',
          fontFamily: 'inherit',
          boxShadow: `0 2px 12px rgba(113,102,240,0.3)`,
        })

        document.body.appendChild(editor)
        editor.focus()
        editor.select()

        const commit = () => {
          if (!document.body.contains(editor)) {
            return
          }
          if (regionId) {
            setRegionLabel(node, regionId, editor.value)
          }
          else {
            node.setLabel(editor.value)
          }
          document.body.removeChild(editor)
        }

        editor.addEventListener('blur', commit)
        editor.addEventListener('keydown', (ke: KeyboardEvent) => {
          if (ke.key === 'Enter' && !ke.shiftKey) {
            ke.preventDefault()
            commit()
          }
          if (ke.key === 'Escape' && document.body.contains(editor)) {
            document.body.removeChild(editor)
          }
        })
      })
    }

    return this.graph
  }

  /**
   * 注入旋转控制柄自定义 SVG 图标
   */
  private injectRotateHandleStyle(path?: string): void {
    if (typeof document === 'undefined')
      return
    const id = 'uni-draw-rotate-handle-style'
    if (document.getElementById(id))
      return
    const handlePath = path ?? 'M512 112A400 400 0 1 0 912 512H832a320 320 0 1 1-55.36-179.968H672v80h240v-240H832v99.904A399.36 399.36 0 0 0 512 112z'
    const svg = `<svg style="vertical-align: middle;" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 1024 1024" fill="#99999C" stroke="#99999C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${handlePath}"/></svg>`
    const encoded = encodeURIComponent(svg)
    const style = document.createElement('style')
    style.id = id
    style.textContent = `.x6-widget-transform-rotate{width:18px;height:18px;border:none;background:transparent;top:-22px;left:-22px;cursor:grab}.x6-widget-transform-rotate::before{content:'';display:block;width:100%;height:100%;background-image:url("data:image/svg+xml,${encoded}");background-repeat:no-repeat;background-position:center}`
    document.head.appendChild(style)
  }

  /**
   * 获取 Graph 实例
   */
  getGraph(): Graph | null {
    return this.graph
  }

  /**
   * 销毁画布
   */
  dispose(): void {
    if (this.resizeObserver && this.container) {
      this.resizeObserver.unobserve(this.container)
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }

    if (this.graph) {
      this.graph.dispose()
      this.graph = null
    }

    this.container = null
  }
}

function mapSelectorToRegionId(shape: string, selector: string): string | undefined {
  const map: Record<string, Record<string, string>> = {
    'uml-class': {
      nameLabel: 'name',
      attrsLabel: 'attributes',
      methodsLabel: 'methods',
    },
    'uml-abstract': {
      stereotypeLabel: 'stereotype',
      nameLabel: 'name',
    },
    'uml-interface': {
      stereotypeLabel: 'stereotype',
      nameLabel: 'name',
    },
    'uml-enum': {
      stereotypeLabel: 'stereotype',
      nameLabel: 'name',
    },
    'sequence-fragment-alt': {
      topLabel: 'top',
      bottomLabel: 'bottom',
    },
    'sequence-fragment-par': {
      topLabel: 'top',
      bottomLabel: 'bottom',
    },
    'swimlane-horizontal': {
      label: 'header',
    },
    'swimlane-vertical': {
      label: 'header',
    },
    'swimlane-pool': {
      label: 'header',
    },
  }
  return map[shape]?.[selector]
}

function getRegionLabel(node: any, regionId: string): string {
  const data = node.getData()
  const regionData = data?.regionData
  if (!regionData) {
    return ''
  }
  const region = regionData.regions?.find((r: any) => r.id === regionId)
  return region?.label ?? ''
}

function setRegionLabel(node: any, regionId: string, value: string): void {
  const data = node.getData() as any
  if (!data?.regionData) {
    return
  }
  const nextRegions = data.regionData.regions.map((r: any) =>
    r.id === regionId ? { ...r, label: value } : r,
  )
  const nextRegionData = { ...data.regionData, regions: nextRegions }
  node.setData({ ...data, regionData: nextRegionData })

  const regionAttrs = buildMultiRegionAttrs(node.shape, nextRegionData)
  if (regionAttrs) {
    Object.keys(regionAttrs).forEach((key) => {
      if (key.endsWith('Label')) {
        node.setAttrByPath(key, regionAttrs[key])
      }
    })
  }
}
