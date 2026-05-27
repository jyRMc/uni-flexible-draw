import type { Node } from '@antv/x6'

export const flowchartDatabase: Node.Config = {
  inherit: 'rect',
  width: 100,
  height: 70,
  markup: [
    { tagName: 'rect',    selector: 'body'      },
    { tagName: 'ellipse', selector: 'bottomCap' },  // 1st: full bottom ellipse
    { tagName: 'rect',    selector: 'bodyFill'  },  // 2nd: covers upper half of bottomCap
    { tagName: 'rect',    selector: 'leftLine'  },  // 3rd: left wall
    { tagName: 'rect',    selector: 'rightLine' },  // 4th: right wall
    { tagName: 'ellipse', selector: 'topCap'    },  // 5th: top ellipse on top of all
    { tagName: 'text',    selector: 'label'     },
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
      refCy: 0.86,
      refRx: 0.5,
      refRy: 0.14,
      fill: '#f6ffed',
      stroke: '#52c41a',
      strokeWidth: 2,
    },
    bodyFill: {
      refX: 0,
      refY: 0.14,
      refWidth: 1,
      refHeight: 0.72,
      fill: '#f6ffed',
      stroke: 'none',
    },
    leftLine: {
      refX: 0,
      refY: 0.14,
      width: 2,
      refHeight: 0.72,
      fill: '#52c41a',
      stroke: 'none',
    },
    rightLine: {
      refDx: -2,
      refY: 0.14,
      width: 2,
      refHeight: 0.72,
      fill: '#52c41a',
      stroke: 'none',
    },
    topCap: {
      refCx: 0.5,
      refCy: 0.14,
      refRx: 0.5,
      refRy: 0.14,
      fill: '#d9f7be',
      stroke: '#52c41a',
      strokeWidth: 2,
    },
    label: {
      fill: '#52c41a',
      fontSize: 14,
      refX: 0.5,
      refY: 0.58,
      textAnchor: 'middle',
      textVerticalAnchor: 'middle',
    },
  },
  ports: {
    groups: {
      top:    { position: 'top',    attrs: { circle: { r: 4, magnet: true, stroke: '#52c41a', fill: '#fff' } } },
      bottom: { position: 'bottom', attrs: { circle: { r: 4, magnet: true, stroke: '#52c41a', fill: '#fff' } } },
      left:   { position: 'left',   attrs: { circle: { r: 4, magnet: true, stroke: '#52c41a', fill: '#fff' } } },
      right:  { position: 'right',  attrs: { circle: { r: 4, magnet: true, stroke: '#52c41a', fill: '#fff' } } },
    },
    items: [
      { id: 'top',    group: 'top'    },
      { id: 'bottom', group: 'bottom' },
      { id: 'left',   group: 'left'   },
      { id: 'right',  group: 'right'  },
    ],
  },
}
