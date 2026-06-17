import type { Node } from '@antv/x6'
import { LABEL_FILL } from '../theme'
import { ellipsePorts, polygonPorts, rectPorts } from '../ports/ports'

const FILL = '#f8fafc'
const STROKE = '#334155'

/** 关联实体：菱形顶点 + 矩形底部中点 */
function associativePorts(style?: { stroke?: string, fill?: string }) {
  const stroke = style?.stroke ?? STROKE
  const fill = style?.fill ?? '#fff'
  const attrs = {
    circle: {
      r: 4,
      magnet: true,
      stroke,
      strokeWidth: 1.5,
      fill,
      style: { visibility: 'hidden' },
    },
  }
  return {
    groups: {
      top: {
        position(args: any) {
          const bbox = args.bbox
          return { x: bbox.width * 0.5, y: bbox.height * 0.05 }
        },
        attrs,
      },
      left: {
        position(args: any) {
          const bbox = args.bbox
          return { x: bbox.width * 0.25, y: bbox.height * 0.45 }
        },
        attrs,
      },
      right: {
        position(args: any) {
          const bbox = args.bbox
          return { x: bbox.width * 0.75, y: bbox.height * 0.45 }
        },
        attrs,
      },
      bottom: {
        position(args: any) {
          const bbox = args.bbox
          return { x: bbox.width * 0.5, y: bbox.height }
        },
        attrs,
      },
    },
    items: [
      { id: 'port-top', group: 'top' },
      { id: 'port-left', group: 'left' },
      { id: 'port-right', group: 'right' },
      { id: 'port-bottom', group: 'bottom' },
    ],
  }
}

export const erEntity: Node.Config = {
  inherit: 'rect',
  width: 160,
  height: 70,
  attrs: {
    body: { fill: FILL, stroke: STROKE, strokeWidth: 2, rx: 0, ry: 0 },
    label: { fill: LABEL_FILL, fontSize: 16, fontWeight: 500 },
  },
  ports: rectPorts({ stroke: STROKE }),
}

export const erWeakEntity: Node.Config = {
  inherit: 'rect',
  width: 160,
  height: 70,
  markup: [
    { tagName: 'rect', selector: 'body' },
    { tagName: 'rect', selector: 'outer' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    body: { refWidth: 1, refHeight: 1, fill: FILL, stroke: STROKE, strokeWidth: 2, rx: 0, ry: 0 },
    outer: { refX: 0.0625, refY: 0.142857, refWidth: 0.875, refHeight: 0.714286, fill: 'none', stroke: STROKE, strokeWidth: 1.5, rx: 0 },
    label: { fill: LABEL_FILL, fontSize: 16, fontWeight: 500 },
  },
  ports: rectPorts({ stroke: STROKE }),
}

export const erRelationship: Node.Config = {
  inherit: 'polygon',
  width: 120,
  height: 120,
  attrs: {
    body: {
      refPoints: '0.5,0.083333 0.916667,0.5 0.5,0.916667 0.083333,0.5',
      fill: FILL,
      stroke: STROKE,
      strokeWidth: 2,
    },
    label: { fill: LABEL_FILL, fontSize: 14, fontWeight: 500 },
  },
  ports: polygonPorts(4, { stroke: STROKE }, '0.5,0.083333 0.916667,0.5 0.5,0.916667 0.083333,0.5'),
}

export const erIdentifyingRelationship: Node.Config = {
  inherit: 'polygon',
  width: 120,
  height: 120,
  markup: [
    { tagName: 'polygon', selector: 'outer' },
    { tagName: 'polygon', selector: 'body' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    outer: {
      refPoints: '0.5,0.083333 0.916667,0.5 0.5,0.916667 0.083333,0.5',
      fill: FILL,
      stroke: STROKE,
      strokeWidth: 2,
    },
    body: {
      refPoints: '0.5,0.208333 0.708333,0.5 0.5,0.791667 0.291667,0.5',
      fill: 'none',
      stroke: STROKE,
      strokeWidth: 1.5,
    },
    label: { fill: LABEL_FILL, fontSize: 14, fontWeight: 500 },
  },
  ports: polygonPorts(4, { stroke: STROKE }, '0.5,0.083333 0.916667,0.5 0.5,0.916667 0.083333,0.5'),
}

export const erAttribute: Node.Config = {
  inherit: 'ellipse',
  width: 160,
  height: 70,
  attrs: {
    body: { refCx: 0.5, refCy: 0.5, refRx: 0.4375, refRy: 0.357143, fill: FILL, stroke: STROKE, strokeWidth: 2 },
    label: { fill: LABEL_FILL, fontSize: 16, fontWeight: 500 },
  },
  ports: ellipsePorts(8, { stroke: STROKE }, 0.4375, 0.357143),
}

export const erKeyAttribute: Node.Config = {
  width: 160,
  height: 80,
  markup: [
    { tagName: 'ellipse', selector: 'body' },
    { tagName: 'line', selector: 'underline' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    body: {
      refCx: 0.5,
      refCy: 0.375,
      refRx: 0.4375,
      refRy: 0.25,
      fill: FILL,
      stroke: STROKE,
      strokeWidth: 2,
    },
    underline: {
      stroke: STROKE,
      strokeWidth: 2,
    },
    label: {
      fill: LABEL_FILL,
      fontSize: 16,
      fontWeight: 500,
      textAnchor: 'middle',
      textVerticalAnchor: 'middle',
      refX: 0.5,
      refY: 0.45,
    },
  },
  ports: ellipsePorts(8, { stroke: STROKE }, 0.4375, 0.25, 0.5, 0.375),
}

export const erMultivalued: Node.Config = {
  inherit: 'ellipse',
  width: 160,
  height: 70,
  markup: [
    { tagName: 'ellipse', selector: 'outer' },
    { tagName: 'ellipse', selector: 'body' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    outer: {
      refCx: 0.5,
      refCy: 0.5,
      refRx: 0.4375,
      refRy: 0.357143,
      fill: FILL,
      stroke: STROKE,
      strokeWidth: 2,
    },
    body: {
      refCx: 0.5,
      refCy: 0.5,
      refRx: 0.375,
      refRy: 0.257143,
      fill: 'none',
      stroke: STROKE,
      strokeWidth: 1.5,
    },
    label: { fill: LABEL_FILL, fontSize: 16, fontWeight: 500 },
  },
  ports: ellipsePorts(8, { stroke: STROKE }, 0.4375, 0.357143),
}

export const erDerived: Node.Config = {
  inherit: 'ellipse',
  width: 160,
  height: 70,
  attrs: {
    body: {
      refCx: 0.5,
      refCy: 0.5,
      refRx: 0.4375,
      refRy: 0.357143,
      fill: FILL,
      stroke: STROKE,
      strokeWidth: 2,
      strokeDasharray: '6 3',
    },
    label: { fill: LABEL_FILL, fontSize: 16, fontWeight: 500 },
  },
  ports: ellipsePorts(8, { stroke: STROKE }),
}

export const erAssociative: Node.Config = {
  width: 160,
  height: 100,
  markup: [
    { tagName: 'rect', selector: 'body' },
    { tagName: 'polygon', selector: 'diamond' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    body: {
      refX: 0.15625,
      refY: 0.85,
      refWidth: 0.6875,
      refHeight: 0.15,
      rx: 2,
      ry: 2,
      fill: FILL,
      stroke: STROKE,
      strokeWidth: 2,
    },
    diamond: {
      refPoints: '0.5,0.05 0.75,0.45 0.5,0.85 0.25,0.45',
      fill: FILL,
      stroke: STROKE,
      strokeWidth: 2,
    },
    label: {
      fill: LABEL_FILL,
      fontSize: 16,
      fontWeight: 500,
      textAnchor: 'middle',
      textVerticalAnchor: 'middle',
      refX: 0.5,
      refY: 0.5,
    },
  },
  ports: associativePorts({ stroke: STROKE }),
}

export const erAnnotation: Node.Config = {
  inherit: 'rect',
  width: 160,
  height: 70,
  attrs: {
    body: {
      fill: FILL,
      stroke: STROKE,
      strokeWidth: 2,
      rx: 8,
      ry: 8,
      strokeDasharray: '6 3',
    },
    label: { fill: LABEL_FILL, fontSize: 16, fontWeight: 500 },
  },
  ports: rectPorts({ stroke: STROKE }),
}

export const erTotalParticipation: Node.Config = {
  inherit: 'polygon',
  width: 120,
  height: 120,
  markup: [
    { tagName: 'polygon', selector: 'outer' },
    { tagName: 'polygon', selector: 'body' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    outer: { fill: FILL, stroke: STROKE, strokeWidth: 3, refPoints: '0.5,0.083333 0.916667,0.5 0.5,0.916667 0.083333,0.5' },
    body: { fill: FILL, stroke: STROKE, strokeWidth: 1.5, refPoints: '0.5,0.208333 0.708333,0.5 0.5,0.791667 0.291667,0.5' },
    label: { fill: LABEL_FILL, fontSize: 14, fontWeight: 500 },
  },
  ports: polygonPorts(4, { stroke: STROKE }, '0.5,0.083333 0.916667,0.5 0.5,0.916667 0.083333,0.5'),
}
