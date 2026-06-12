import type { Edge } from '@antv/x6'
import { PRIMARY_COLOR } from '../theme'

export const edgeLine: Edge.Config = {
  inherit: 'edge',
  attrs: {
    line: {
      stroke: PRIMARY_COLOR,
      strokeWidth: 2,
      sourceMarker: null,
      targetMarker: null,
    },
  },
}
