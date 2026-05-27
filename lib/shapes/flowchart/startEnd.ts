import type { Node } from '@antv/x6'

export const flowchartStartEnd: Node.Config = {
  inherit: 'rect',
  width: 100,
  height: 50,
  attrs: {
    body: {
      fill: '#e6f7ff',
      stroke: '#1890ff',
      strokeWidth: 2,
      rx: 25,
      ry: 25,
    },
    label: {
      fill: '#1890ff',
      fontSize: 14,
    },
  },
  ports: {
    groups: {
      top: { position: 'top', attrs: { circle: { r: 4, magnet: true, stroke: '#1890ff', fill: '#fff' } } },
      bottom: { position: 'bottom', attrs: { circle: { r: 4, magnet: true, stroke: '#1890ff', fill: '#fff' } } },
      left: { position: 'left', attrs: { circle: { r: 4, magnet: true, stroke: '#1890ff', fill: '#fff' } } },
      right: { position: 'right', attrs: { circle: { r: 4, magnet: true, stroke: '#1890ff', fill: '#fff' } } },
    },
    items: [
      { id: 'top', group: 'top' },
      { id: 'bottom', group: 'bottom' },
      { id: 'left', group: 'left' },
      { id: 'right', group: 'right' },
    ],
  },
}
