import type { Node } from '@antv/x6'

export const umlUseCase: Node.Config = {
  inherit: 'ellipse',
  width: 140,
  height: 60,
  attrs: {
    body: {
      fill: '#fffde7',
      stroke: '#333333',
      strokeWidth: 1.5,
    },
    label: {
      fill: '#333333',
      fontSize: 12,
    },
  },
  ports: {
    groups: {
      top: { position: 'top', attrs: { circle: { r: 4, magnet: true, stroke: '#333', fill: '#fff' } } },
      bottom: { position: 'bottom', attrs: { circle: { r: 4, magnet: true, stroke: '#333', fill: '#fff' } } },
      left: { position: 'left', attrs: { circle: { r: 4, magnet: true, stroke: '#333', fill: '#fff' } } },
      right: { position: 'right', attrs: { circle: { r: 4, magnet: true, stroke: '#333', fill: '#fff' } } },
    },
    items: [
      { id: 'top', group: 'top' },
      { id: 'bottom', group: 'bottom' },
      { id: 'left', group: 'left' },
      { id: 'right', group: 'right' },
    ],
  },
}
