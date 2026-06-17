import type { Node } from '@antv/x6'
import { ellipsePorts } from '../ports/ports'

export const umlFinal: Node.Config = {
  inherit: 'circle',
  width: 30,
  height: 30,
  markup: [
    { tagName: 'circle', selector: 'outer' },
    { tagName: 'circle', selector: 'inner' },
    { tagName: 'text', selector: 'label' },
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
    label: {
      fill: '#333',
      fontSize: 10,
      refX: 0.5,
      refY: 1.25,
      textAnchor: 'middle',
      textVerticalAnchor: 'top',
    },
  },
  ports: ellipsePorts(8, { stroke: '#333' }, 0.4667, 0.4667),
}
