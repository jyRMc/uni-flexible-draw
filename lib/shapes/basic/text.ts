import { PRIMARY_COLOR } from '../theme'
import type { Node } from '@antv/x6'

const PORTS = {
  groups: {
    top: { position: 'top', attrs: { circle: { r: 4, magnet: true, stroke: PRIMARY_COLOR, fill: '#fff' } } },
    bottom: { position: 'bottom', attrs: { circle: { r: 4, magnet: true, stroke: PRIMARY_COLOR, fill: '#fff' } } },
    left: { position: 'left', attrs: { circle: { r: 4, magnet: true, stroke: PRIMARY_COLOR, fill: '#fff' } } },
    right: { position: 'right', attrs: { circle: { r: 4, magnet: true, stroke: PRIMARY_COLOR, fill: '#fff' } } },
  },
  items: [
    { id: 'top', group: 'top' },
    { id: 'bottom', group: 'bottom' },
    { id: 'left', group: 'left' },
    { id: 'right', group: 'right' },
  ],
}

export const basicText: Node.Config = {
  inherit: 'rect',
  width: 120,
  height: 36,
  attrs: {
    body: {
      fill: 'transparent',
      stroke: 'transparent',
      strokeWidth: 0,
    },
    label: {
      fill: '#333333',
      fontSize: 14,
      textWrap: { width: -4, ellipsis: true },
    },
  },
  ports: PORTS,
}

export const basicSvg: Node.Config = {
  inherit: 'image',
  width: 200,
  height: 200,
  attrs: {
    image: {
      refWidth: '100%',
      refHeight: '100%',
      x: 0,
      y: 0,
      'xlink:href': "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='%23f8f9fa' stroke='%23dee2e6' stroke-width='2' stroke-dasharray='8 4' rx='4'/%3E%3Ctext x='100' y='108' text-anchor='middle' fill='%23adb5bd' font-size='14' font-family='sans-serif'%3ESVG%3C/text%3E%3C/svg%3E",
    },
    label: {
      refX: 0.5,
      refY: '100%',
      refY2: 10,
      textAnchor: 'middle',
      textVerticalAnchor: 'top',
      fill: '#333',
      fontSize: 12,
    },
  },
  ports: PORTS,
}

export const basicImage: Node.Config = {
  inherit: 'image',
  width: 80,
  height: 80,
  attrs: {
    image: {
      width: 80,
      height: 80,
      x: 0,
      y: 0,
      'xlink:href': "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='%23f0f2f5' rx='4'/%3E%3Crect x='18' y='14' width='44' height='32' fill='none' stroke='%23bbb' stroke-width='2' rx='2'/%3E%3Cpolygon points='18,46 34,30 44,38 56,24 62,46' fill='%23ddd'/%3E%3Ccircle cx='28' cy='24' r='5' fill='%23ddd'/%3E%3C/svg%3E",
    },
    label: {
      refX: 0.5,
      refY: '100%',
      refY2: 10,
      textAnchor: 'middle',
      textVerticalAnchor: 'top',
      fill: '#333',
      fontSize: 12,
    },
  },
  ports: PORTS,
}
