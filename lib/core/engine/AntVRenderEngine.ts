import { Graph } from '@antv/x6'
import { History } from '@antv/x6-plugin-history'
import { Selection } from '@antv/x6-plugin-selection'
import { Transform } from '@antv/x6-plugin-transform'
import type { CanvasConfig } from '@uni-draw/shared'
import { PRIMARY_COLOR } from '@uni-draw/shared'
import { icons } from '../../assets/icons'

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
        enabled: true,
        eventTypes: ['rightMouseDown', 'mouseWheelDown'],
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
            shape: 'edge',
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
          enabled: node => node.getData()?.locked !== true,
          orthogonal: false,
          preserveAspectRatio: false,
        },
        rotating: {
          enabled: node => node.getData()?.locked !== true,
        },
      }),
    )

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
          if (ke.key === 'Escape' && document.body.contains(editor))
            document.body.removeChild(editor)
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
    const svg = path
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 1024 1024" fill="#99999C" stroke="#99999C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${path}"/></svg>`
      : icons['toolbar/rotate-handle']
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
