import type { Node } from '@antv/x6'

export const umlInitial: Node.Config = {
  inherit: 'circle',
  width: 30,
  height: 30,
  attrs: {
    body: {
      fill: '#333333',
      stroke: '#333333',
      strokeWidth: 1,
    },
  },
  ports: {
    groups: {
      top: { position: 'top', attrs: { circle: { r: 3, magnet: true, stroke: '#333', fill: '#fff' } } },
      bottom: { position: 'bottom', attrs: { circle: { r: 3, magnet: true, stroke: '#333', fill: '#fff' } } },
      left: { position: 'left', attrs: { circle: { r: 3, magnet: true, stroke: '#333', fill: '#fff' } } },
      right: { position: 'right', attrs: { circle: { r: 3, magnet: true, stroke: '#333', fill: '#fff' } } },
    },
    items: [
      { id: 'top', group: 'top' },
      { id: 'bottom', group: 'bottom' },
      { id: 'left', group: 'left' },
      { id: 'right', group: 'right' },
    ],
  },
}
