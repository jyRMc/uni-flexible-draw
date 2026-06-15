import type { Node } from '@antv/x6'

export const flowchartPredefined: Node.Config = {
  inherit: 'rect',
  width: 100,
  height: 60,
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
      fill: '#f6ffed',
      stroke: '#52c41a',
      strokeWidth: 2,
      rx: 0,
      ry: 0,
    },
    lineLeft: {
      refX: 0.1,
      refY: 0,
      width: 2,
      refHeight: 1,
      fill: '#52c41a',
      stroke: 'none',
      cursor: 'ew-resize',
    },
    lineRight: {
      refX: 0.88,
      refY: 0,
      width: 2,
      refHeight: 1,
      fill: '#52c41a',
      stroke: 'none',
      cursor: 'ew-resize',
    },
    label: {
      fill: '#52c41a',
      fontSize: 14,
    },
  },
  ports: {
    groups: {
      top: { position: 'top', attrs: { circle: { r: 4, magnet: true, stroke: '#52c41a', fill: '#fff' } } },
      bottom: { position: 'bottom', attrs: { circle: { r: 4, magnet: true, stroke: '#52c41a', fill: '#fff' } } },
      left: { position: 'left', attrs: { circle: { r: 4, magnet: true, stroke: '#52c41a', fill: '#fff' } } },
      right: { position: 'right', attrs: { circle: { r: 4, magnet: true, stroke: '#52c41a', fill: '#fff' } } },
    },
    items: [
      { id: 'top', group: 'top' },
      { id: 'bottom', group: 'bottom' },
      { id: 'left', group: 'left' },
      { id: 'right', group: 'right' },
    ],
  },
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
  ports: {
    groups: {
      top: { position: 'top', attrs: { circle: { r: 4, magnet: true, stroke: '#52c41a', fill: '#fff' } } },
      bottom: { position: 'bottom', attrs: { circle: { r: 4, magnet: true, stroke: '#52c41a', fill: '#fff' } } },
      left: { position: 'left', attrs: { circle: { r: 4, magnet: true, stroke: '#52c41a', fill: '#fff' } } },
      right: { position: 'right', attrs: { circle: { r: 4, magnet: true, stroke: '#52c41a', fill: '#fff' } } },
    },
    items: [
      { id: 'top', group: 'top' },
      { id: 'bottom', group: 'bottom' },
      { id: 'left', group: 'left' },
      { id: 'right', group: 'right' },
    ],
  },
}

export const flowchartConnector: Node.Config = {
  inherit: 'circle',
  width: 20,
  height: 20,
  attrs: {
    body: {
      fill: '#52c41a',
      stroke: '#389e0d',
      strokeWidth: 2,
    },
  },
  ports: {
    groups: {
      center: { position: 'center', attrs: { circle: { r: 6, magnet: true, stroke: '#52c41a', fill: '#fff' } } },
    },
    items: [
      { id: 'center', group: 'center' },
    ],
  },
}

export const flowchartMerge: Node.Config = {
  inherit: 'polygon',
  width: 60,
  height: 60,
  attrs: {
    body: {
      refPoints: '0.5,0 1,0.5 0.5,1 0,0.5',
      fill: '#f6ffed',
      stroke: '#52c41a',
      strokeWidth: 2,
    },
  },
  ports: {
    groups: {
      top: { position: 'top', attrs: { circle: { r: 4, magnet: true, stroke: '#52c41a', fill: '#fff' } } },
      bottom: { position: 'bottom', attrs: { circle: { r: 4, magnet: true, stroke: '#52c41a', fill: '#fff' } } },
      left: { position: 'left', attrs: { circle: { r: 4, magnet: true, stroke: '#52c41a', fill: '#fff' } } },
      right: { position: 'right', attrs: { circle: { r: 4, magnet: true, stroke: '#52c41a', fill: '#fff' } } },
    },
    items: [
      { id: 'top', group: 'top' },
      { id: 'bottom', group: 'bottom' },
      { id: 'left', group: 'left' },
      { id: 'right', group: 'right' },
    ],
  },
}
