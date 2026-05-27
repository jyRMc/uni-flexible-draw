import type { Node } from '@antv/x6'

export const flowchartDecision: Node.Config = {
  inherit: 'polygon',
  width: 80,
  height: 60,
  attrs: {
    body: {
      refPoints: '0.5,0 1,0.5 0.5,1 0,0.5',
      fill: '#fff7e6',
      stroke: '#fa8c16',
      strokeWidth: 2,
    },
    label: {
      fill: '#fa8c16',
      fontSize: 14,
    },
  },
  ports: {
    groups: {
      top: { position: 'top', attrs: { circle: { r: 4, magnet: true, stroke: '#fa8c16', fill: '#fff' } } },
      bottom: { position: 'bottom', attrs: { circle: { r: 4, magnet: true, stroke: '#fa8c16', fill: '#fff' } } },
      left: { position: 'left', attrs: { circle: { r: 4, magnet: true, stroke: '#fa8c16', fill: '#fff' } } },
      right: { position: 'right', attrs: { circle: { r: 4, magnet: true, stroke: '#fa8c16', fill: '#fff' } } },
    },
    items: [
      { id: 'top', group: 'top' },
      { id: 'bottom', group: 'bottom' },
      { id: 'left', group: 'left' },
      { id: 'right', group: 'right' },
    ],
  },
}
