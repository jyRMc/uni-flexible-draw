import type { Node } from '@antv/x6'
import { ellipsePorts, polygonPorts, rectPorts } from '../ports/ports'
import { LABEL_FILL } from '../theme'

export const flowchartPredefined: Node.Config = {
  inherit: 'rect',
  width: 160,
  height: 70,
  markup: [
    { tagName: 'rect', selector: 'body' },
    { tagName: 'rect', selector: 'lineLeft' },
    { tagName: 'rect', selector: 'lineRight' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    body: {
      refWidth: 1,
      refHeight: 1,
      fill: '#f8fafc',
      stroke: '#334155',
      strokeWidth: 2,
      rx: 0,
      ry: 0,
    },
    lineLeft: {
      refX: 0.15625,
      refY: 0,
      width: 1.5,
      refHeight: 1,
      fill: '#334155',
      stroke: 'none',
    },
    lineRight: {
      refX: 0.84375,
      refY: 0,
      width: 1.5,
      refHeight: 1,
      fill: '#334155',
      stroke: 'none',
    },
    label: {
      fill: LABEL_FILL,
      fontSize: 14,
    },
  },
  ports: rectPorts({ stroke: '#334155' }),
}

export const flowchartInternalStorage: Node.Config = {
  inherit: 'rect',
  width: 100,
  height: 60,
  markup: [
    { tagName: 'rect', selector: 'body' },
    { tagName: 'rect', selector: 'topBar' },
    { tagName: 'rect', selector: 'leftBar' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    body: {
      refWidth: 1,
      refHeight: 1,
      fill: '#f6ffed',
      stroke: '#52c41a',
      strokeWidth: 2,
      rx: 0,
      ry: 0,
    },
    topBar: {
      refX: 0,
      refY: 0.2,
      refWidth: 1,
      refHeight: 0.025,
      fill: '#52c41a',
      stroke: 'none',
    },
    leftBar: {
      refX: 0.1,
      refY: 0,
      refWidth: 0.025,
      refHeight: 1,
      fill: '#52c41a',
      stroke: 'none',
    },
    label: {
      fill: '#52c41a',
      fontSize: 14,
      refX: 0.55,
      refY: 0.58,
      textAnchor: 'middle',
      textVerticalAnchor: 'middle',
    },
  },
  ports: rectPorts({ stroke: '#52c41a' }),
}

export const flowchartConnector: Node.Config = {
  inherit: 'circle',
  width: 50,
  height: 50,
  attrs: {
    body: {
      refR: 0.36,
      fill: '#f8fafc',
      stroke: '#334155',
      strokeWidth: 2,
    },
    label: {
      fill: LABEL_FILL,
      fontSize: 14,
      refX: 0.5,
      refY: 0.55,
      textAnchor: 'middle',
      textVerticalAnchor: 'middle',
    },
  },
  ports: ellipsePorts(8, { stroke: '#334155' }, 0.36, 0.36),
}

export const flowchartMerge: Node.Config = {
  inherit: 'polygon',
  width: 40,
  height: 40,
  attrs: {
    body: {
      refPoints: '0.5,0.15 0.85,0.5 0.5,0.85 0.15,0.5',
      fill: '#334155',
      stroke: '#334155',
      strokeWidth: 2,
    },
  },
  ports: polygonPorts(4, { stroke: '#334155' }, '0.5,0.15 0.85,0.5 0.5,0.85 0.15,0.5'),
}
