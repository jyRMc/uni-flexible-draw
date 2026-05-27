import { PRIMARY_COLOR } from '../theme'
import type { Edge } from '@antv/x6'

export const edgeCurve: Edge.Config = {
  inherit: 'edge',
  connector: { name: 'smooth' },
  attrs: {
    line: {
      stroke: PRIMARY_COLOR,
      strokeWidth: 2,
      sourceMarker: null,
      targetMarker: null,
    },
  },
}
