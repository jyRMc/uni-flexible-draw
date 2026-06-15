export interface LineDef {
  x1: number
  y1: number
  x2: number
  y2: number
}

/**
 * SVG <line> 节点不支持百分比坐标，因此用归一化端点定义。
 * NodeFactory 在创建节点及 resize 时根据实际尺寸换算为具体像素值。
 */
export const shapeLineDefs: Record<string, Record<string, LineDef>> = {
  'state-fork': {
    stem: { x1: 0.5, y1: 1 / 6, x2: 0.5, y2: 0.5 },
    bar: { x1: 1 / 6, y1: 0.5, x2: 5 / 6, y2: 0.5 },
    branch1: { x1: 0.25, y1: 0.5, x2: 0.25, y2: 5 / 6 },
    branch2: { x1: 0.5, y1: 0.5, x2: 0.5, y2: 5 / 6 },
    branch3: { x1: 0.75, y1: 0.5, x2: 0.75, y2: 5 / 6 },
  },
  'state-join': {
    branch1: { x1: 0.25, y1: 1 / 6, x2: 0.25, y2: 0.5 },
    branch2: { x1: 0.5, y1: 1 / 6, x2: 0.5, y2: 0.5 },
    branch3: { x1: 0.75, y1: 1 / 6, x2: 0.75, y2: 0.5 },
    bar: { x1: 1 / 6, y1: 0.5, x2: 5 / 6, y2: 0.5 },
    stem: { x1: 0.5, y1: 0.5, x2: 0.5, y2: 5 / 6 },
  },
  'state-entry-point': {
    arrowLine: { x1: 5 / 140, y1: 0.5, x2: 24 / 140, y2: 0.5 },
  },
  'state-exit-point': {
    cross1: { x1: 102 / 140, y1: 32 / 70, x2: 108 / 140, y2: 38 / 70 },
    cross2: { x1: 108 / 140, y1: 32 / 70, x2: 102 / 140, y2: 38 / 70 },
    arrowLine: { x1: 111 / 140, y1: 0.5, x2: 130 / 140, y2: 0.5 },
  },
  'state-signal-send': {
    flap1: { x1: 0.75, y1: 5 / 70, x2: 155 / 160, y2: 0.5 },
    flap2: { x1: 0.75, y1: 65 / 70, x2: 155 / 160, y2: 0.5 },
  },
  'state-signal-receive': {
    flap1: { x1: 0.25, y1: 5 / 70, x2: 5 / 160, y2: 0.5 },
    flap2: { x1: 0.25, y1: 65 / 70, x2: 5 / 160, y2: 0.5 },
  },
  'state-terminate': {
    cross1: { x1: 0.3, y1: 0.3, x2: 0.7, y2: 0.7 },
    cross2: { x1: 0.7, y1: 0.3, x2: 0.3, y2: 0.7 },
  },
  'flowchart-database': {
    leftLine: { x1: 0, y1: 0.28, x2: 0, y2: 0.72 },
    rightLine: { x1: 1, y1: 0.28, x2: 1, y2: 0.72 },
  },
  'basic-cylinder': {
    leftLine: { x1: 0, y1: 0.24, x2: 0, y2: 0.76 },
    rightLine: { x1: 1, y1: 0.24, x2: 1, y2: 0.76 },
  },
}
