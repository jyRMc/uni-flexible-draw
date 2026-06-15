import type { Node } from '@antv/x6'
import { PRIMARY_COLOR } from '../theme'

export const basicRoundedRect: Node.Config = {
  inherit: 'rect',
  width: 100,
  height: 60,
  attrs: {
    body: {
      fill: '#ffffff',
      stroke: PRIMARY_COLOR,
      strokeWidth: 2,
      rx: 10,
      ry: 10,
    },
    label: {
      fill: '#333333',
      fontSize: 14,
    },
  },
  ports: {
    groups: {
      top: { position: 'top', attrs: { circle: { r: 4, magnet: true, stroke: PRIMARY_COLOR, fill: '#fff' } } },
      bottom: { position: 'bottom', attrs: { circle: { r: 4, magnet: true, stroke: PRIMARY_COLOR, fill: '#fff' } } },
      left: { position: 'left', attrs: { circle: { r: 4, magnet: true, stroke: PRIMARY_COLOR, fill: '#fff' } } },
      right: { position: 'right', attrs: { circle: { r: 4, magnet: true, stroke: PRIMARY_COLOR, fill: '#fff' } } },
    },
    items: [
      { id: 'top', group: 'top' },
      { id: 'bottom', group: 'bottom' },
      { id: 'left', group: 'left' },
      { id: 'right', group: 'right' },
    ],
  },
}
