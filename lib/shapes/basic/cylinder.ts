import { PRIMARY_COLOR } from '../theme'
import type { Node } from '@antv/x6'

/**
 * 圆柱体 — 真实 3D 圆柱外观
 * 结构（从下到上绘制，确保正确遮挡关系）：
 *   bodyRect   背景填充矩形（ry=12%~88%，无描边）
 *   bottomCap  底部椭圆盖
 *   leftWall   左侧边线
 *   rightWall  右侧边线
 *   topCap     顶部椭圆盖（最后绘制，覆盖边线顶端）
 *
 * 各元素使用 ref* 相对坐标，resize 时自动缩放。
 * ellipse cy_ratio = ry_ratio = 0.12，侧壁从 12%~88%。
 */
export const basicCylinder: Node.Config = {
  inherit: 'rect',
  width: 100,
  height: 70,
  markup: [
    { tagName: 'rect',    selector: 'body'      },
    { tagName: 'ellipse', selector: 'bottomCap' },  // 1st: full bottom ellipse
    { tagName: 'rect',    selector: 'bodyFill'  },  // 2nd: covers upper half of bottomCap
    { tagName: 'line',    selector: 'leftLine'  },  // 3rd: left wall
    { tagName: 'line',    selector: 'rightLine' },  // 4th: right wall
    { tagName: 'ellipse', selector: 'topCap'    },  // 5th: top ellipse on top of all
    { tagName: 'text',    selector: 'label'     },
  ],
  attrs: {
    body: {
      refWidth: 1,
      refHeight: 1,
      fill: 'transparent',
      stroke: 'none',
    },
    bottomCap: {
      refCx: 0.5,
      refCy: 0.88,
      refRx: 0.5,
      refRy: 0.12,
      fill: '#f0f5ff',
      stroke: PRIMARY_COLOR,
      strokeWidth: 2,
    },
    bodyFill: {
      refX: 0,
      refY: 0.12,
      refWidth: 1,
      refHeight: 0.76,
      fill: '#f0f5ff',
      stroke: 'none',
    },
    leftLine: {
      x1: '0%',
      y1: '12%',
      x2: '0%',
      y2: '88%',
      stroke: PRIMARY_COLOR,
      strokeWidth: 2,
      visibility: 'hidden',
    },
    rightLine: {
      x1: '100%',
      y1: '12%',
      x2: '100%',
      y2: '88%',
      stroke: PRIMARY_COLOR,
      strokeWidth: 2,
      visibility: 'hidden',
    },
    topCap: {
      refCx: 0.5,
      refCy: 0.12,
      refRx: 0.5,
      refRy: 0.12,
      fill: '#d6e4ff',
      stroke: PRIMARY_COLOR,
      strokeWidth: 2,
    },
    label: {
      fill: '#333333',
      fontSize: 14,
      refX: 0.5,
      refY: 0.55,
      textAnchor: 'middle',
      textVerticalAnchor: 'middle',
    },
  },
  ports: {
    groups: {
      top:    { position: 'top',    attrs: { circle: { r: 4, magnet: true, stroke: PRIMARY_COLOR, fill: '#fff' } } },
      bottom: { position: 'bottom', attrs: { circle: { r: 4, magnet: true, stroke: PRIMARY_COLOR, fill: '#fff' } } },
      left:   { position: 'left',   attrs: { circle: { r: 4, magnet: true, stroke: PRIMARY_COLOR, fill: '#fff' } } },
      right:  { position: 'right',  attrs: { circle: { r: 4, magnet: true, stroke: PRIMARY_COLOR, fill: '#fff' } } },
    },
    items: [
      { id: 'top',    group: 'top'    },
      { id: 'bottom', group: 'bottom' },
      { id: 'left',   group: 'left'   },
      { id: 'right',  group: 'right'  },
    ],
  },
}
