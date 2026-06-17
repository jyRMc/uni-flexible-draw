import type { Node } from '@antv/x6'
import { databasePorts } from '../ports/ports'
import { LABEL_FILL } from '../theme'

export const flowchartDatabase: Node.Config = {
  inherit: 'rect',
  width: 160,
  height: 90,
  markup: [
    { tagName: 'rect', selector: 'body' },
    { tagName: 'ellipse', selector: 'bottomCap' },
    { tagName: 'rect', selector: 'bodyFill' },
    { tagName: 'line', selector: 'leftLine' },
    { tagName: 'line', selector: 'rightLine' },
    { tagName: 'ellipse', selector: 'topCap' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    body: {
      refWidth: 1,
      refHeight: 1,
      fill: 'transparent',
      stroke: 'none',
    },
    bottomCap: {
      refCx: 0.5,
      refCy: 0.833333,
      refRx: 0.4375,
      refRy: 0.111111,
      fill: 'none',
      stroke: '#334155',
      strokeWidth: 2,
    },
    bodyFill: {
      refX: 0,
      refY: 0.166667,
      refWidth: 1,
      refHeight: 0.666667,
      fill: '#f8fafc',
      stroke: 'none',
    },
    leftLine: {
      stroke: '#334155',
      strokeWidth: 2,
    },
    rightLine: {
      stroke: '#334155',
      strokeWidth: 2,
    },
    topCap: {
      refCx: 0.5,
      refCy: 0.166667,
      refRx: 0.4375,
      refRy: 0.111111,
      fill: '#f8fafc',
      stroke: '#334155',
      strokeWidth: 2,
    },
    label: {
      fill: LABEL_FILL,
      fontSize: 14,
      refX: 0.5,
      refY: 0.5556,
      textAnchor: 'middle',
      textVerticalAnchor: 'middle',
    },
  },
  ports: databasePorts({ stroke: '#334155' }),
}
