import { PRIMARY_COLOR } from '../theme'
import type { Edge } from '@antv/x6'

export const edgeLine: Edge.Config = {
  inherit: 'edge',
  attrs: {
    line: {
      stroke: PRIMARY_COLOR,
      strokeWidth: 2,
    },
  },
}
