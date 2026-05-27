import { PRIMARY_COLOR } from '../theme'
import type { Edge } from '@antv/x6'

export const edgeDashed: Edge.Config = {
  inherit: 'edge',
  attrs: {
    line: {
      stroke: PRIMARY_COLOR,
      strokeWidth: 2,
      strokeDasharray: '5 5',
      sourceMarker: null,
      targetMarker: null,
    },
  },
}
