import { Graph } from '@antv/x6'
import { History } from '@antv/x6-plugin-history'
import { Selection } from '@antv/x6-plugin-selection'
import { Transform } from '@antv/x6-plugin-transform'
import type { CanvasConfig } from '@uni-draw/shared'
import { PRIMARY_COLOR } from '@uni-draw/shared'

export interface AntVRenderEngineOptions {
  canvasConfig?: CanvasConfig
  readonly?: boolean
  grid?: boolean
  snapline?: boolean
  keyboard?: boolean
  minimap?: boolean
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
        enabled: true,
        eventTypes: ['rightMouseDown'],
      },
      mousewheel: {
        enabled: true,
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
      snapline: options.snapline !== false
        ? { enabled: true }
        : undefined,
      keyboard: options.keyboard !== false
        ? { enabled: true }
        : undefined,
      interacting: options.readonly
        ? { nodeMovable: false, edgeMovable: false, arrowheadMovable: false }
        : ((cellView: any) => {
            const isLocked = cellView.cell?.getData?.()?.locked === true
            if (cellView.cell?.isEdge?.()) {
              if (isLocked) {
                return {
                  edgeMovable: false,
                  vertexAddable: false,
                  vertexMovable: false,
                  vertexDeletable: false,
                  arrowheadMovable: false,
                }
              }

              const isSelected = this.graph?.isSelected?.(cellView.cell) ?? false
              return {
                edgeMovable: isSelected,
                vertexAddable: !isSelected,
                vertexMovable: !isSelected,
                vertexDeletable: !isSelected,
                arrowheadMovable: !isSelected,
              }
            }

            return {
              nodeMovable: !isLocked,
            }
          }),
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

    // 安装 Selection 插件（点击/框选节点和边）
    this.graph.use(
      new Selection({
        enabled: true,
        multiple: true,
        rubberband: true,
        movable: true,
        showNodeSelectionBox: true,
        showEdgeSelectionBox: false,
        selectEdgeOnMoved: true,
      }),
    )

    // 安装 History 插件（撤销/重做）
    this.graph.use(new History({ enabled: true }))

    // 安装 Transform 插件（缩放/旋转）
    this.graph.use(
      new Transform({
        resizing: {
          enabled: true,
          orthogonal: false,
          preserveAspectRatio: false,
        },
        rotating: {
          enabled: true,
        },
      }),
    )

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

      this.graph.on('node:mouseenter', ({ node, view }: any) => {
        const ports = view.container.querySelectorAll('.x6-port-body') as NodeListOf<SVGElement>
        ports.forEach((el) => { el.style.visibility = 'visible' })
        node.setTools([])
      })
      this.graph.on('node:mouseleave', ({ node, view }: any) => {
        const ports = view.container.querySelectorAll('.x6-port-body') as NodeListOf<SVGElement>
        ports.forEach((el) => { el.style.visibility = 'hidden' })
        node.removeTools()
      })

      this.graph.on('edge:mouseenter', ({ edge }: any) => {
        edge.setTools(edge.shape === 'edge-sketch'
          ? [
              { name: 'source-arrowhead', args: { attrs: { fill: PRIMARY_COLOR, r: 5 } } },
              { name: 'target-arrowhead', args: { attrs: { fill: PRIMARY_COLOR, r: 5 } } },
            ]
          : [
              {
                name: 'segments',
                args: {
                  threshold: 12,
                  snapRadius: 10,
                  attrs: {
                    fill: PRIMARY_COLOR,
                    stroke: '#fff',
                    'stroke-width': 2,
                    width: 20,
                    height: 8,
                    x: -10,
                    y: -4,
                    rx: 4,
                    ry: 4,
                    cursor: 'move',
                  },
                },
              },
              { name: 'source-arrowhead', args: { attrs: { fill: PRIMARY_COLOR, r: 5 } } },
              { name: 'target-arrowhead', args: { attrs: { fill: PRIMARY_COLOR, r: 5 } } },
            ])
      })
      this.graph.on('edge:mouseleave', ({ edge, e }: any) => {
        const graph = this.graph
        if (!graph) return
        if (graph.isSelected?.(edge) || isEdgeToolElement(e?.relatedTarget ?? null)) return
        edge.removeTools()
      })

      // 双击节点：浮层 textarea 内联编辑标签（图片/SVG 节点由 useCanvas 处理）
      this.graph.on('node:dblclick', ({ node, e }: any) => {
        if (node.shape === 'basic-image' || node.shape === 'basic-svg') return
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
        } else {
          const { tx, ty } = this.graph!.translate()
          const rect = container.getBoundingClientRect()
          clientX = rect.left + tx + pos.x * zoom
          clientY = rect.top + ty + pos.y * zoom
        }

        const w = size.width * zoom
        const h = size.height * zoom

        const editor = document.createElement('textarea')
        editor.value = (node.getLabel() as string) ?? ''
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
          if (document.body.contains(editor)) {
            node.setLabel(editor.value)
            document.body.removeChild(editor)
          }
        }

        editor.addEventListener('blur', commit)
        editor.addEventListener('keydown', (ke: KeyboardEvent) => {
          if (ke.key === 'Enter' && !ke.shiftKey) { ke.preventDefault(); commit() }
          if (ke.key === 'Escape' && document.body.contains(editor)) document.body.removeChild(editor)
        })
      })
    }

    return this.graph
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
