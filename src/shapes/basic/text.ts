import type { Node } from '@antv/x6'
import { PRIMARY_COLOR } from '../theme'
import { icons } from '@/assets/icons'

const SVG_PLACEHOLDER_HREF = `data:image/svg+xml,${encodeURIComponent(icons['placeholder/svg-placeholder'])}`
const IMAGE_PLACEHOLDER_HREF = `data:image/svg+xml,${encodeURIComponent(icons['placeholder/image-placeholder'])}`

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
  markup: [
    { tagName: 'rect', selector: 'body' },
    { tagName: 'image', selector: 'image' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    body: {
      fill: 'transparent',
      stroke: 'none',
      refWidth: '100%',
      refHeight: '100%',
    },
    image: {
      'refWidth': '100%',
      'refHeight': '100%',
      'x': 0,
      'y': 0,
      'xlink:href': SVG_PLACEHOLDER_HREF,
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
  markup: [
    { tagName: 'rect', selector: 'body' },
    { tagName: 'image', selector: 'image' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    body: {
      fill: 'transparent',
      stroke: 'none',
      refWidth: '100%',
      refHeight: '100%',
    },
    image: {
      'refWidth': '100%',
      'refHeight': '100%',
      'x': 0,
      'y': 0,
      'xlink:href': IMAGE_PLACEHOLDER_HREF,
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
