import type { PortsConfig } from '../../shared/types'
import { PRIMARY_COLOR } from '../theme'

export interface PortStyle {
  r?: number
  stroke?: string
  fill?: string
}

function portAttrs(style?: PortStyle) {
  return {
    circle: {
      r: style?.r ?? 4,
      magnet: true,
      stroke: style?.stroke ?? PRIMARY_COLOR,
      strokeWidth: 1.5,
      fill: style?.fill ?? '#fff',
      style: { visibility: 'hidden' },
    },
  }
}

/** 矩形类：上下左右 4 个边中点 */
export function rectPorts(style?: PortStyle): PortsConfig {
  const attrs = portAttrs(style)
  return {
    groups: {
      top: { position: 'top', attrs },
      bottom: { position: 'bottom', attrs },
      left: { position: 'left', attrs },
      right: { position: 'right', attrs },
    },
    items: [
      { id: 'port-top', group: 'top' },
      { id: 'port-bottom', group: 'bottom' },
      { id: 'port-left', group: 'left' },
      { id: 'port-right', group: 'right' },
    ],
  }
}

/** 圆形/椭圆：边界均匀分布 count 个连接点（默认 8 个） */
export function ellipsePorts(count = 8, style?: PortStyle): PortsConfig {
  const attrs = portAttrs(style)
  const groups: PortsConfig['groups'] = {}
  const items: PortsConfig['items'] = []
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count - Math.PI / 2 // 从顶部开始
    const gid = `p${i}`
    groups[gid] = {
      position(args: any) {
        const bbox = args.bbox
        const cx = bbox.width / 2
        const cy = bbox.height / 2
        return {
          x: cx + cx * Math.cos(angle),
          y: cy + cy * Math.sin(angle),
        }
      },
      attrs,
    }
    items.push({ id: gid, group: gid })
  }
  return { groups, items }
}

/** 菱形：4 个顶点 */
export function diamondPorts(style?: PortStyle): PortsConfig {
  const attrs = portAttrs(style)
  return {
    groups: {
      top: {
        position(args: any) {
          const bbox = args.bbox
          return { x: bbox.width / 2, y: 0 }
        },
        attrs,
      },
      right: {
        position(args: any) {
          const bbox = args.bbox
          return { x: bbox.width, y: bbox.height / 2 }
        },
        attrs,
      },
      bottom: {
        position(args: any) {
          const bbox = args.bbox
          return { x: bbox.width / 2, y: bbox.height }
        },
        attrs,
      },
      left: {
        position(args: any) {
          const bbox = args.bbox
          return { x: 0, y: bbox.height / 2 }
        },
        attrs,
      },
    },
    items: [
      { id: 'port-top', group: 'top' },
      { id: 'port-right', group: 'right' },
      { id: 'port-bottom', group: 'bottom' },
      { id: 'port-left', group: 'left' },
    ],
  }
}

/** 三角形：3 个顶点（默认等腰三角形，顶点在上） */
export function trianglePorts(style?: PortStyle): PortsConfig {
  const attrs = portAttrs(style)
  return {
    groups: {
      top: {
        position(args: any) {
          const bbox = args.bbox
          return { x: bbox.width / 2, y: 0 }
        },
        attrs,
      },
      bottomLeft: {
        position(args: any) {
          const bbox = args.bbox
          return { x: 0, y: bbox.height }
        },
        attrs,
      },
      bottomRight: {
        position(args: any) {
          const bbox = args.bbox
          return { x: bbox.width, y: bbox.height }
        },
        attrs,
      },
    },
    items: [
      { id: 'port-top', group: 'top' },
      { id: 'port-bottom-left', group: 'bottomLeft' },
      { id: 'port-bottom-right', group: 'bottomRight' },
    ],
  }
}

/**
 * 正多边形：按顶点数 n 均匀分布在边界
 *
 * @param n - 顶点数
 * @param style - 连接点样式
 * @param points - 可选，与 shape 的 refPoints 一致的归一化顶点坐标串（如 '0.5,0 1,0.38 ...'），
 *                 提供后连接点将严格对齐实际绘图顶点，而不是按外接圆估算。
 */
export function polygonPorts(n: number, style?: PortStyle, points?: string): PortsConfig {
  const attrs = portAttrs(style)
  const groups: PortsConfig['groups'] = {}
  const items: PortsConfig['items'] = []

  // 解析归一化顶点坐标，用于精确对齐 polygon 的 refPoints
  const normalizedPoints = points
    ? points.trim().split(/\s+/).map((pair) => {
        const [x, y] = pair.split(',').map(v => Number(v))
        return { x, y }
      })
    : []

  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2
    const gid = `p${i}`
    const normalized = normalizedPoints[i]
    groups[gid] = {
      position(args: any) {
        const bbox = args.bbox
        // 如果提供了与 refPoints 对应的顶点坐标，直接使用，保证和实际绘制顶点重合
        if (normalized) {
          return {
            x: bbox.width * normalized.x,
            y: bbox.height * normalized.y,
          }
        }
        // 否则按外接圆估算
        const cx = bbox.width / 2
        const cy = bbox.height / 2
        return {
          x: cx + cx * Math.cos(angle),
          y: cy + cy * Math.sin(angle),
        }
      },
      attrs,
    }
    items.push({ id: gid, group: gid })
  }
  return { groups, items }
}

/**
 * 星形：points 个外顶点 + points 个内凹点（共 points*2 个）
 *
 * @param points - 外顶点数
 * @param style - 连接点样式
 * @param vertices - 可选，与 shape 的 refPoints 一致的归一化顶点坐标串，
 *                   提供后连接点将严格对齐实际绘图顶点，而不是按正星形估算。
 */
export function starPorts(points = 5, style?: PortStyle, vertices?: string): PortsConfig {
  const attrs = portAttrs(style)
  const groups: PortsConfig['groups'] = {}
  const items: PortsConfig['items'] = []
  const total = points * 2

  // 解析归一化顶点坐标，用于精确对齐 polygon 的 refPoints
  const normalizedVertices = vertices
    ? vertices.trim().split(/\s+/).map((pair) => {
        const [x, y] = pair.split(',').map(v => Number(v))
        return { x, y }
      })
    : []

  for (let i = 0; i < total; i++) {
    const angle = (Math.PI * 2 * i) / total - Math.PI / 2
    const isOuter = i % 2 === 0
    const gid = `p${i}`
    const normalized = normalizedVertices[i]
    groups[gid] = {
      position(args: any) {
        const bbox = args.bbox
        // 如果提供了与 refPoints 对应的顶点坐标，直接使用，保证和实际绘制顶点重合
        if (normalized) {
          return {
            x: bbox.width * normalized.x,
            y: bbox.height * normalized.y,
          }
        }
        // 否则按正星形估算
        const cx = bbox.width / 2
        const cy = bbox.height / 2
        const r = isOuter ? cx : cx * 0.4
        return {
          x: cx + r * Math.cos(angle),
          y: cy + r * Math.sin(angle),
        }
      },
      attrs,
    }
    items.push({ id: gid, group: gid })
  }
  return { groups, items }
}

/** UML 类图：左右各 2 个 + 上下各 1 个 */
export function umlClassPorts(style?: PortStyle): PortsConfig {
  const attrs = portAttrs(style)
  return {
    groups: {
      top: { position: 'top', attrs },
      bottom: { position: 'bottom', attrs },
      leftTop: {
        position(args: any) {
          const bbox = args.bbox
          return { x: 0, y: bbox.height * 0.25 }
        },
        attrs,
      },
      leftBottom: {
        position(args: any) {
          const bbox = args.bbox
          return { x: 0, y: bbox.height * 0.75 }
        },
        attrs,
      },
      rightTop: {
        position(args: any) {
          const bbox = args.bbox
          return { x: bbox.width, y: bbox.height * 0.25 }
        },
        attrs,
      },
      rightBottom: {
        position(args: any) {
          const bbox = args.bbox
          return { x: bbox.width, y: bbox.height * 0.75 }
        },
        attrs,
      },
    },
    items: [
      { id: 'port-top', group: 'top' },
      { id: 'port-bottom', group: 'bottom' },
      { id: 'port-left-top', group: 'leftTop' },
      { id: 'port-left-bottom', group: 'leftBottom' },
      { id: 'port-right-top', group: 'rightTop' },
      { id: 'port-right-bottom', group: 'rightBottom' },
    ],
  }
}

/** 泳道图：上下左右 4 个边中点（与矩形相同但样式可选不同） */
export function swimlanePorts(style?: PortStyle): PortsConfig {
  return rectPorts(style)
}

/** Actor（火柴人）：头部 + 四肢末端 */
export function actorPorts(style?: PortStyle): PortsConfig {
  const attrs = portAttrs(style)
  return {
    groups: {
      head: {
        position(args: any) {
          const bbox = args.bbox
          return { x: bbox.width / 2, y: 0 }
        },
        attrs,
      },
      leftHand: {
        position(args: any) {
          const bbox = args.bbox
          return { x: 0, y: bbox.height * 0.35 }
        },
        attrs,
      },
      rightHand: {
        position(args: any) {
          const bbox = args.bbox
          return { x: bbox.width, y: bbox.height * 0.35 }
        },
        attrs,
      },
      leftFoot: {
        position(args: any) {
          const bbox = args.bbox
          return { x: bbox.width * 0.15, y: bbox.height }
        },
        attrs,
      },
      rightFoot: {
        position(args: any) {
          const bbox = args.bbox
          return { x: bbox.width * 0.85, y: bbox.height }
        },
        attrs,
      },
    },
    items: [
      { id: 'port-head', group: 'head' },
      { id: 'port-left-hand', group: 'leftHand' },
      { id: 'port-right-hand', group: 'rightHand' },
      { id: 'port-left-foot', group: 'leftFoot' },
      { id: 'port-right-foot', group: 'rightFoot' },
    ],
  }
}

/** 时序图 Lifeline：顶部矩形四边 */
export function lifelinePorts(style?: PortStyle): PortsConfig {
  const attrs = portAttrs(style)
  return {
    groups: {
      top: { position: 'top', attrs },
      bottom: { position: 'bottom', attrs },
      left: { position: 'left', attrs },
      right: { position: 'right', attrs },
    },
    items: [
      { id: 'port-top', group: 'top' },
      { id: 'port-bottom', group: 'bottom' },
      { id: 'port-left', group: 'left' },
      { id: 'port-right', group: 'right' },
    ],
  }
}

/** 时序图 Activation：上下 2 个 */
export function activationPorts(style?: PortStyle): PortsConfig {
  const attrs = portAttrs(style)
  return {
    groups: {
      top: { position: 'top', attrs },
      bottom: { position: 'bottom', attrs },
    },
    items: [
      { id: 'port-top', group: 'top' },
      { id: 'port-bottom', group: 'bottom' },
    ],
  }
}

/** Fork：1 个顶部 + 3 个底部分支 */
export function forkPorts(style?: PortStyle): PortsConfig {
  const attrs = portAttrs(style)
  return {
    groups: {
      top: {
        position(args: any) {
          const bbox = args.bbox
          return { x: bbox.width * 0.5, y: bbox.height * 0.1667 }
        },
        attrs,
      },
      bottom1: {
        position(args: any) {
          const bbox = args.bbox
          return { x: bbox.width * 0.25, y: bbox.height * 0.8333 }
        },
        attrs,
      },
      bottom2: {
        position(args: any) {
          const bbox = args.bbox
          return { x: bbox.width * 0.5, y: bbox.height * 0.8333 }
        },
        attrs,
      },
      bottom3: {
        position(args: any) {
          const bbox = args.bbox
          return { x: bbox.width * 0.75, y: bbox.height * 0.8333 }
        },
        attrs,
      },
    },
    items: [
      { id: 'port-top', group: 'top' },
      { id: 'port-bottom-1', group: 'bottom1' },
      { id: 'port-bottom-2', group: 'bottom2' },
      { id: 'port-bottom-3', group: 'bottom3' },
    ],
  }
}

/** Join：3 个顶部分支 + 1 个底部 */
export function joinPorts(style?: PortStyle): PortsConfig {
  const attrs = portAttrs(style)
  return {
    groups: {
      top1: {
        position(args: any) {
          const bbox = args.bbox
          return { x: bbox.width * 0.25, y: bbox.height * 0.1667 }
        },
        attrs,
      },
      top2: {
        position(args: any) {
          const bbox = args.bbox
          return { x: bbox.width * 0.5, y: bbox.height * 0.1667 }
        },
        attrs,
      },
      top3: {
        position(args: any) {
          const bbox = args.bbox
          return { x: bbox.width * 0.75, y: bbox.height * 0.1667 }
        },
        attrs,
      },
      bottom: {
        position(args: any) {
          const bbox = args.bbox
          return { x: bbox.width * 0.5, y: bbox.height * 0.8333 }
        },
        attrs,
      },
    },
    items: [
      { id: 'port-top-1', group: 'top1' },
      { id: 'port-top-2', group: 'top2' },
      { id: 'port-top-3', group: 'top3' },
      { id: 'port-bottom', group: 'bottom' },
    ],
  }
}

/** 时序图 Fragment：上下各 2 个 */
export function fragmentPorts(style?: PortStyle): PortsConfig {
  const attrs = portAttrs(style)
  return {
    groups: {
      topLeft: {
        position(args: any) {
          const bbox = args.bbox
          return { x: bbox.width * 0.25, y: 0 }
        },
        attrs,
      },
      topRight: {
        position(args: any) {
          const bbox = args.bbox
          return { x: bbox.width * 0.75, y: 0 }
        },
        attrs,
      },
      bottomLeft: {
        position(args: any) {
          const bbox = args.bbox
          return { x: bbox.width * 0.25, y: bbox.height }
        },
        attrs,
      },
      bottomRight: {
        position(args: any) {
          const bbox = args.bbox
          return { x: bbox.width * 0.75, y: bbox.height }
        },
        attrs,
      },
    },
    items: [
      { id: 'port-top-left', group: 'topLeft' },
      { id: 'port-top-right', group: 'topRight' },
      { id: 'port-bottom-left', group: 'bottomLeft' },
      { id: 'port-bottom-right', group: 'bottomRight' },
    ],
  }
}
