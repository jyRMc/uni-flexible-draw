import { PRIMARY_COLOR } from '../theme'
import type { Edge } from '@antv/x6'

export const edgeOrthogonal: Edge.Config = {
  inherit: 'edge',
  router: { name: 'orth' },
  connector: { name: 'rounded', args: { radius: 10 } },
  attrs: {
    line: {
      stroke: PRIMARY_COLOR,
      strokeWidth: 2,
    },
  },
}
