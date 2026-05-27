import type { Node } from '@antv/x6'

export const umlFinal: Node.Config = {
  inherit: 'circle',
  width: 30,
  height: 30,
  markup: [
    { tagName: 'circle', selector: 'outer' },
    { tagName: 'circle', selector: 'inner' },
  ],
  attrs: {
    outer: {
      r: 14,
      cx: 15,
      cy: 15,
      fill: '#ffffff',
      stroke: '#333333',
      strokeWidth: 2,
    },
    inner: {
      r: 8,
      cx: 15,
      cy: 15,
      fill: '#333333',
      stroke: 'none',
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
