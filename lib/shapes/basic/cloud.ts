import { PRIMARY_COLOR } from '../theme'
import type { Node } from '@antv/x6'

export const basicCloud: Node.Config = {
  inherit: 'path',
  width: 120,
  height: 70,
  markup: [
    { tagName: 'path', selector: 'body' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    body: {
      refD: 'M 0.15 0.8 Q 0 0.8 0 0.614 Q 0 0.429 0.117 0.429 Q 0.117 0.143 0.3 0.143 Q 0.4 0.143 0.442 0.3 Q 0.483 0.143 0.6 0.143 Q 0.8 0.143 0.8 0.429 Q 1 0.429 1 0.614 Q 1 0.8 0.85 0.8 Z',
      fill: '#f0f5ff',
      stroke: PRIMARY_COLOR,
      strokeWidth: 2,
    },
    label: {
      fill: '#333333',
      fontSize: 14,
      refX: 0.5,
      refY: 0.72,
      textAnchor: 'middle',
      textVerticalAnchor: 'middle',
    },
  },
  ports: {
    groups: {
      top:    { position: 'top',    attrs: { circle: { r: 4, magnet: true, stroke: PRIMARY_COLOR, fill: '#fff' } } },
      bottom: { position: 'bottom', attrs: { circle: { r: 4, magnet: true, stroke: PRIMARY_COLOR, fill: '#fff' } } },
      left:   { position: 'left',   attrs: { circle: { r: 4, magnet: true, stroke: PRIMARY_COLOR, fill: '#fff' } } },
      right:  { position: 'right',  attrs: { circle: { r: 4, magnet: true, stroke: PRIMARY_COLOR, fill: '#fff' } } },
    },
    items: [
      { id: 'top',    group: 'top'    },
      { id: 'bottom', group: 'bottom' },
      { id: 'left',   group: 'left'   },
      { id: 'right',  group: 'right'  },
    ],
  },
}
