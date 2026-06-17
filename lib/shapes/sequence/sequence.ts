import type { Node } from '@antv/x6'
import { activationPorts, actorPorts, diamondPorts, lifelinePorts } from '../ports/ports'
import { PRIMARY_COLOR } from '../theme'

export const sequenceActor: Node.Config = {
  inherit: 'rect',
  width: 60,
  height: 90,
  markup: [
    { tagName: 'circle', selector: 'actorHead' },
    { tagName: 'line', selector: 'actorBody' },
    { tagName: 'line', selector: 'actorArms' },
    { tagName: 'line', selector: 'actorLegL' },
    { tagName: 'line', selector: 'actorLegR' },
    { tagName: 'line', selector: 'actorLine' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    actorHead: { r: 10, cx: 30, cy: 10, fill: 'transparent', stroke: '#333', strokeWidth: 1.5 },
    actorBody: { x1: 30, y1: 20, x2: 30, y2: 48, stroke: '#333', strokeWidth: 1.5 },
    actorArms: { x1: 12, y1: 32, x2: 48, y2: 32, stroke: '#333', strokeWidth: 1.5 },
    actorLegL: { x1: 30, y1: 48, x2: 14, y2: 68, stroke: '#333', strokeWidth: 1.5 },
    actorLegR: { x1: 30, y1: 48, x2: 46, y2: 68, stroke: '#333', strokeWidth: 1.5 },
    actorLine: { x1: 30, y1: 68, x2: 30, y2: 90, stroke: '#333', strokeWidth: 1, strokeDasharray: '4 2' },
    label: { fill: '#333', fontSize: 11, refX: 0.5, refY: 0.95, textAnchor: 'middle', textVerticalAnchor: 'bottom' },
  },
  ports: actorPorts({ stroke: '#333' }),
}

export const sequenceLifeline: Node.Config = {
  inherit: 'rect',
  width: 120,
  height: 200,
  markup: [
    { tagName: 'rect', selector: 'header' },
    { tagName: 'text', selector: 'label' },
    { tagName: 'line', selector: 'lifeline' },
  ],
  attrs: {
    header: { width: 120, height: 30, x: 0, y: 0, fill: '#e8f0fe', stroke: PRIMARY_COLOR, strokeWidth: 1.5, rx: 4, ry: 4 },
    label: { fill: '#333', fontSize: 12, refX: 0.5, refY: 0.08, textAnchor: 'middle', textVerticalAnchor: 'middle' },
    lifeline: { x1: 60, y1: 30, x2: 60, y2: 200, stroke: PRIMARY_COLOR, strokeWidth: 1, strokeDasharray: '6 3' },
  },
  ports: lifelinePorts({ stroke: PRIMARY_COLOR }),
}

export const sequenceActivation: Node.Config = {
  inherit: 'rect',
  width: 16,
  height: 60,
  attrs: {
    body: { fill: '#e8f0fe', stroke: PRIMARY_COLOR, strokeWidth: 1.5, rx: 2, ry: 2 },
    label: { fill: '#333', fontSize: 10 },
  },
  ports: activationPorts({ stroke: PRIMARY_COLOR }),
}

export const sequenceFragmentAlt: Node.Config = {
  inherit: 'rect',
  width: 300,
  height: 200,
  markup: [
    { tagName: 'rect', selector: 'body' },
    { tagName: 'rect', selector: 'tab' },
    { tagName: 'text', selector: 'tabLabel' },
    { tagName: 'rect', selector: 'divider' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    body: { fill: '#fff', stroke: '#999', strokeWidth: 1.5, rx: 2, ry: 2 },
    tab: { width: 50, height: 22, x: 0, y: 0, fill: '#f5f5f5', stroke: '#999', strokeWidth: 1 },
    tabLabel: { text: 'alt', fill: '#333', fontSize: 11, fontWeight: 'bold', x: 25, y: 14, textAnchor: 'middle', textVerticalAnchor: 'middle' },
    divider: { refX: 0, refY: 0.5, refWidth: 1, refHeight: 0.005, fill: '#999', stroke: 'none', strokeDasharray: '4 2' },
    label: { fill: '#333', fontSize: 11, refX: 0.55, refY: 0.12, textAnchor: 'start', textVerticalAnchor: 'middle' },
  },
  ports: {
    groups: {
      top: { position: 'top', attrs: { circle: { r: 4, magnet: true, stroke: '#999', fill: '#fff' } } },
      bottom: { position: 'bottom', attrs: { circle: { r: 4, magnet: true, stroke: '#999', fill: '#fff' } } },
    },
    items: [
      { id: 'top', group: 'top' },
      { id: 'bottom', group: 'bottom' },
    ],
  },
}

export const sequenceFragmentOpt: Node.Config = {
  inherit: 'rect',
  width: 300,
  height: 150,
  markup: [
    { tagName: 'rect', selector: 'body' },
    { tagName: 'rect', selector: 'tab' },
    { tagName: 'text', selector: 'tabLabel' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    body: { fill: '#fff', stroke: '#999', strokeWidth: 1.5, rx: 2, ry: 2 },
    tab: { width: 40, height: 22, x: 0, y: 0, fill: '#f5f5f5', stroke: '#999', strokeWidth: 1 },
    tabLabel: { text: 'opt', fill: '#333', fontSize: 11, fontWeight: 'bold', x: 20, y: 14, textAnchor: 'middle', textVerticalAnchor: 'middle' },
    label: { fill: '#333', fontSize: 11, refX: 0.55, refY: 0.12, textAnchor: 'start', textVerticalAnchor: 'middle' },
  },
  ports: {
    groups: {
      top: { position: 'top', attrs: { circle: { r: 4, magnet: true, stroke: '#999', fill: '#fff' } } },
      bottom: { position: 'bottom', attrs: { circle: { r: 4, magnet: true, stroke: '#999', fill: '#fff' } } },
    },
    items: [
      { id: 'top', group: 'top' },
      { id: 'bottom', group: 'bottom' },
    ],
  },
}

export const sequenceFragmentLoop: Node.Config = {
  inherit: 'rect',
  width: 300,
  height: 150,
  markup: [
    { tagName: 'rect', selector: 'body' },
    { tagName: 'rect', selector: 'tab' },
    { tagName: 'text', selector: 'tabLabel' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    body: { fill: '#fff', stroke: '#999', strokeWidth: 1.5, rx: 2, ry: 2 },
    tab: { width: 48, height: 22, x: 0, y: 0, fill: '#f5f5f5', stroke: '#999', strokeWidth: 1 },
    tabLabel: { text: 'loop', fill: '#333', fontSize: 11, fontWeight: 'bold', x: 24, y: 14, textAnchor: 'middle', textVerticalAnchor: 'middle' },
    label: { fill: '#333', fontSize: 11, refX: 0.55, refY: 0.12, textAnchor: 'start', textVerticalAnchor: 'middle' },
  },
  ports: {
    groups: {
      top: { position: 'top', attrs: { circle: { r: 4, magnet: true, stroke: '#999', fill: '#fff' } } },
      bottom: { position: 'bottom', attrs: { circle: { r: 4, magnet: true, stroke: '#999', fill: '#fff' } } },
    },
    items: [
      { id: 'top', group: 'top' },
      { id: 'bottom', group: 'bottom' },
    ],
  },
}

export const sequenceFragmentPar: Node.Config = {
  inherit: 'rect',
  width: 300,
  height: 200,
  markup: [
    { tagName: 'rect', selector: 'body' },
    { tagName: 'rect', selector: 'tab' },
    { tagName: 'text', selector: 'tabLabel' },
    { tagName: 'rect', selector: 'divider' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    body: { fill: '#fff', stroke: '#999', strokeWidth: 1.5, rx: 2, ry: 2 },
    tab: { width: 38, height: 22, x: 0, y: 0, fill: '#f5f5f5', stroke: '#999', strokeWidth: 1 },
    tabLabel: { text: 'par', fill: '#333', fontSize: 11, fontWeight: 'bold', x: 19, y: 14, textAnchor: 'middle', textVerticalAnchor: 'middle' },
    divider: { refX: 0, refY: 0.5, refWidth: 1, refHeight: 0.005, fill: '#999', stroke: 'none', strokeDasharray: '4 2' },
    label: { fill: '#333', fontSize: 11, refX: 0.55, refY: 0.12, textAnchor: 'start', textVerticalAnchor: 'middle' },
  },
  ports: {
    groups: {
      top: { position: 'top', attrs: { circle: { r: 4, magnet: true, stroke: '#999', fill: '#fff' } } },
      bottom: { position: 'bottom', attrs: { circle: { r: 4, magnet: true, stroke: '#999', fill: '#fff' } } },
    },
    items: [
      { id: 'top', group: 'top' },
      { id: 'bottom', group: 'bottom' },
    ],
  },
}

export const sequenceFragmentCritical: Node.Config = {
  inherit: 'rect',
  width: 300,
  height: 150,
  markup: [
    { tagName: 'rect', selector: 'body' },
    { tagName: 'rect', selector: 'tab' },
    { tagName: 'text', selector: 'tabLabel' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    body: { fill: '#fff', stroke: '#999', strokeWidth: 1.5, rx: 2, ry: 2 },
    tab: { width: 38, height: 22, x: 0, y: 0, fill: '#f5f5f5', stroke: '#999', strokeWidth: 1 },
    tabLabel: { text: 'crit', fill: '#333', fontSize: 11, fontWeight: 'bold', x: 19, y: 14, textAnchor: 'middle', textVerticalAnchor: 'middle' },
    label: { fill: '#333', fontSize: 11, refX: 0.55, refY: 0.12, textAnchor: 'start', textVerticalAnchor: 'middle' },
  },
  ports: {
    groups: {
      top: { position: 'top', attrs: { circle: { r: 4, magnet: true, stroke: '#999', fill: '#fff' } } },
      bottom: { position: 'bottom', attrs: { circle: { r: 4, magnet: true, stroke: '#999', fill: '#fff' } } },
    },
    items: [
      { id: 'top', group: 'top' },
      { id: 'bottom', group: 'bottom' },
    ],
  },
}

export const sequenceGateway: Node.Config = {
  inherit: 'polygon',
  width: 40,
  height: 40,
  attrs: {
    body: { fill: '#fffde7', stroke: '#333', strokeWidth: 1.5, refPoints: '0,0.5 0.5,0 1,0.5 0.5,1' },
    label: { fill: '#333', fontSize: 10 },
  },
  ports: diamondPorts({ stroke: '#333' }),
}
