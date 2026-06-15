import type { Node } from '@antv/x6'

export const umlActor: Node.Config = {
  inherit: 'rect',
  width: 40,
  height: 80,
  markup: [
    // head
    { tagName: 'circle', selector: 'actorHead' },
    // body
    { tagName: 'line', selector: 'actorBody' },
    // arms
    { tagName: 'line', selector: 'actorArms' },
    // left leg
    { tagName: 'line', selector: 'actorLegL' },
    // right leg
    { tagName: 'line', selector: 'actorLegR' },
    // label
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    actorHead: {
      r: 8,
      cx: 20,
      cy: 8,
      fill: 'transparent',
      stroke: '#333333',
      strokeWidth: 1.5,
    },
    actorBody: {
      x1: 20,
      y1: 16,
      x2: 20,
      y2: 40,
      stroke: '#333333',
      strokeWidth: 1.5,
    },
    actorArms: {
      x1: 8,
      y1: 26,
      x2: 32,
      y2: 26,
      stroke: '#333333',
      strokeWidth: 1.5,
    },
    actorLegL: {
      x1: 20,
      y1: 40,
      x2: 8,
      y2: 58,
      stroke: '#333333',
      strokeWidth: 1.5,
    },
    actorLegR: {
      x1: 20,
      y1: 40,
      x2: 32,
      y2: 58,
      stroke: '#333333',
      strokeWidth: 1.5,
    },
    label: {
      fill: '#333333',
      fontSize: 11,
      refX: 0.5,
      refY: 0.9,
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
