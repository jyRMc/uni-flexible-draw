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
          console.log('DIAMOND TOP position args:', args)
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

/** 正多边形：按顶点数 n 均匀分布在边界 */
export function polygonPorts(n: number, style?: PortStyle): PortsConfig {
  const attrs = portAttrs(style)
  const groups: PortsConfig['groups'] = {}
  const items: PortsConfig['items'] = []
  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2
    const gid = `p${i}`
    groups[gid] = {
      position(args: any) {
        const bbox = args.bbox
        const cx = bbox.width / 2
        const cy = bbox.height / 2
        // 使用外接圆上的点
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

/** 星形：5 个外顶点 + 5 个内凹点（共 10 个） */
export function starPorts(points = 5, style?: PortStyle): PortsConfig {
  const attrs = portAttrs(style)
  const groups: PortsConfig['groups'] = {}
  const items: PortsConfig['items'] = []
  const total = points * 2
  for (let i = 0; i < total; i++) {
    const angle = (Math.PI * 2 * i) / total - Math.PI / 2
    const isOuter = i % 2 === 0
    const gid = `p${i}`
    groups[gid] = {
      position(args: any) {
        const bbox = args.bbox
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
