import type { Edge } from '@antv/x6'
import { PRIMARY_COLOR } from '../theme'

export const edgeArrow: Edge.Config = {
  inherit: 'edge',
  attrs: {
    line: {
      stroke: PRIMARY_COLOR,
      strokeWidth: 2,
      targetMarker: {
        name: 'classic',
        size: 10,
      },
    },
  },
}

export const edgeDoubleArrow: Edge.Config = {
  inherit: 'edge',
  attrs: {
    line: {
      stroke: PRIMARY_COLOR,
      strokeWidth: 2,
      sourceMarker: {
        name: 'classic',
        size: 10,
      },
      targetMarker: {
        name: 'classic',
        size: 10,
      },
    },
  },
}
