import type { Node } from '@antv/x6'

export const umlDeployment: Node.Config = {
  inherit: 'rect',
  width: 140,
  height: 80,
  markup: [
    // 3D cube: front face
    { tagName: 'rect', selector: 'body' },
    // top face (parallelogram)
    { tagName: 'polygon', selector: 'topFace' },
    // right face (parallelogram)
    { tagName: 'polygon', selector: 'rightFace' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    body: {
      fill: '#ffffff',
      stroke: '#333333',
      strokeWidth: 1.5,
      rx: 0,
      ry: 0,
    },
    topFace: {
      fill: '#f0f0f0',
      stroke: '#333333',
      strokeWidth: 1,
      refPoints: '0,0 20,-15 140,-15 120,0',
    },
    rightFace: {
      fill: '#e0e0e0',
      stroke: '#333333',
      strokeWidth: 1,
      refPoints: '140,0 140,80 160,65 160,-15 140,-15 140,0',
    },
    label: {
      fill: '#333333',
      fontSize: 13,
      refX: 0.45,
      refY: 0.55,
      textAnchor: 'middle',
      textVerticalAnchor: 'middle',
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
