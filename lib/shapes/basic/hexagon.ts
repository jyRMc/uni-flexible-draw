import type { Node } from '@antv/x6'
import { PRIMARY_COLOR } from '../theme'

export const basicHexagon: Node.Config = {
  inherit: 'polygon',
  width: 80,
  height: 70,
  attrs: {
    body: {
      refPoints: '0.5,0 1,0.25 1,0.75 0.5,1 0,0.75 0,0.25',
      fill: '#ffffff',
      stroke: PRIMARY_COLOR,
      strokeWidth: 2,
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
