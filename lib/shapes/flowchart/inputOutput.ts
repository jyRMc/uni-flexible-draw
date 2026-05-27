import type { Node } from '@antv/x6'

export const flowchartInputOutput: Node.Config = {
  inherit: 'polygon',
  width: 100,
  height: 60,
  attrs: {
    body: {
      refPoints: '0.2,0 0.8,0 1,1 0,1',
      fill: '#f6ffed',
      stroke: '#52c41a',
      strokeWidth: 2,
    },
    label: {
      fill: '#52c41a',
      fontSize: 14,
    },
  },
  ports: {
    groups: {
      top: { position: 'top', attrs: { circle: { r: 4, magnet: true, stroke: '#52c41a', fill: '#fff' } } },
      bottom: { position: 'bottom', attrs: { circle: { r: 4, magnet: true, stroke: '#52c41a', fill: '#fff' } } },
      left: { position: 'left', attrs: { circle: { r: 4, magnet: true, stroke: '#52c41a', fill: '#fff' } } },
      right: { position: 'right', attrs: { circle: { r: 4, magnet: true, stroke: '#52c41a', fill: '#fff' } } },
    },
    items: [
      { id: 'top', group: 'top' },
      { id: 'bottom', group: 'bottom' },
      { id: 'left', group: 'left' },
      { id: 'right', group: 'right' },
    ],
  },
}
