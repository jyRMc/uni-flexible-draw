import type { Node } from '@antv/x6'
import { PRIMARY_COLOR } from '@uni-draw/shared'

export const basicCross: Node.Config = {
  inherit: 'polygon',
  width: 70,
  height: 70,
  attrs: {
    body: {
      refPoints: '0.35,0 0.65,0 0.65,0.35 1,0.35 1,0.65 0.65,0.65 0.65,1 0.35,1 0.35,0.65 0,0.65 0,0.35 0.35,0.35',
      fill: '#f0f5ff',
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
      top: { position: 'top', attrs: { circle: { r: 4, magnet: true, stroke: '#ff4d4f', fill: '#fff' } } },
      bottom: { position: 'bottom', attrs: { circle: { r: 4, magnet: true, stroke: '#ff4d4f', fill: '#fff' } } },
      left: { position: 'left', attrs: { circle: { r: 4, magnet: true, stroke: '#ff4d4f', fill: '#fff' } } },
      right: { position: 'right', attrs: { circle: { r: 4, magnet: true, stroke: '#ff4d4f', fill: '#fff' } } },
    },
    items: [
      { id: 'top', group: 'top' },
      { id: 'bottom', group: 'bottom' },
      { id: 'left', group: 'left' },
      { id: 'right', group: 'right' },
    ],
  },
}
