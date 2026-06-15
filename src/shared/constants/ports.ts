import type { PortsConfig } from '../types'
import { PRIMARY_COLOR } from './theme'

/**
 * 外部节点（图片/SVG/路径）的默认四向连接桩配置
 * 连接桩默认隐藏，节点 hover 时由引擎显示
 */
export const DEFAULT_PORTS: PortsConfig = {
  groups: {
    top: {
      position: 'top',
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: PRIMARY_COLOR,
          strokeWidth: 1.5,
          fill: '#fff',
          style: { visibility: 'hidden' },
        },
      },
    },
    right: {
      position: 'right',
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: PRIMARY_COLOR,
          strokeWidth: 1.5,
          fill: '#fff',
          style: { visibility: 'hidden' },
        },
      },
    },
    bottom: {
      position: 'bottom',
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: PRIMARY_COLOR,
          strokeWidth: 1.5,
          fill: '#fff',
          style: { visibility: 'hidden' },
        },
      },
    },
    left: {
      position: 'left',
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: PRIMARY_COLOR,
          strokeWidth: 1.5,
          fill: '#fff',
          style: { visibility: 'hidden' },
        },
      },
    },
  },
  items: [
    { id: 'port-top', group: 'top' },
    { id: 'port-right', group: 'right' },
    { id: 'port-bottom', group: 'bottom' },
    { id: 'port-left', group: 'left' },
  ],
}
