/**
 * Shape 分类常量
 */
export const SHAPE_CATEGORIES = {
  BASIC: 'basic',
  EDGE: 'edge',
  FLOWCHART: 'flowchart',
  UML: 'uml',
  SEQUENCE: 'sequence',
  ER: 'er',
  DFD: 'dfd',
  SWIMLANE: 'swimlane',
  STATE: 'state',
} as const

export type ShapeCategory = (typeof SHAPE_CATEGORIES)[keyof typeof SHAPE_CATEGORIES]

/**
 * 基础图形
 */
export const BASIC_SHAPES = {
  RECT: 'basic-rect',
  ROUNDED_RECT: 'basic-rounded-rect',
  CIRCLE: 'basic-circle',
  DIAMOND: 'basic-diamond',
  TRIANGLE: 'basic-triangle',
  PARALLELOGRAM: 'basic-parallelogram',
  TRAPEZOID: 'basic-trapezoid',
  HEXAGON: 'basic-hexagon',
  PENTAGON: 'basic-pentagon',
  OCTAGON: 'basic-octagon',
  STAR: 'basic-star',
  CROSS: 'basic-cross',
  CYLINDER: 'basic-cylinder',
  CLOUD: 'basic-cloud',
  DOCUMENT: 'basic-document',
  TABLE: 'basic-table',
  TEXT: 'basic-text',
  IMAGE: 'basic-image',
  SVG: 'basic-svg',
  GROUP: 'basic-group',
} as const

/**
 * 连接线
 */
export const EDGE_SHAPES = {
  LINE: 'edge-line',
  SKETCH: 'edge-sketch',
  DASHED: 'edge-dashed',
  ARROW: 'edge-arrow',
  DOUBLE_ARROW: 'edge-double-arrow',
  CURVE: 'edge-curve',
  ORTHOGONAL: 'edge-orthogonal',
} as const

/**
 * 流程图图形
 */
export const FLOWCHART_SHAPES = {
  START_END: 'flowchart-start-end',
  PROCESS: 'flowchart-process',
  DECISION: 'flowchart-decision',
  INPUT_OUTPUT: 'flowchart-input-output',
  DOCUMENT: 'flowchart-document',
  PREDEFINED: 'flowchart-predefined',
  INTERNAL_STORAGE: 'flowchart-internal-storage',
  DATABASE: 'flowchart-database',
  CONNECTOR: 'flowchart-connector',
  MERGE: 'flowchart-merge',
} as const

/**
 * UML 类图图形
 */
export const UML_SHAPES = {
  CLASS: 'uml-class',
  INTERFACE: 'uml-interface',
  ABSTRACT: 'uml-abstract',
  ENUM: 'uml-enum',
  PACKAGE: 'uml-package',
  NOTE: 'uml-note',
  ACTOR: 'uml-actor',
  USE_CASE: 'uml-use-case',
  COMPONENT: 'uml-component',
  DEPLOYMENT: 'uml-deployment',
  OBJECT: 'uml-object',
  COLLABORATION: 'uml-collaboration',
  COMPOSITE: 'uml-composite',
  NODE: 'uml-node',
  ARTIFACT: 'uml-artifact',
} as const

/**
 * 时序图图形
 */
export const SEQUENCE_SHAPES = {
  ACTOR: 'sequence-actor',
  LIFELINE: 'sequence-lifeline',
  ACTIVATION: 'sequence-activation',
  FRAGMENT_ALT: 'sequence-fragment-alt',
  FRAGMENT_OPT: 'sequence-fragment-opt',
  FRAGMENT_LOOP: 'sequence-fragment-loop',
  FRAGMENT_PAR: 'sequence-fragment-par',
  FRAGMENT_CRITICAL: 'sequence-fragment-critical',
  GATEWAY: 'sequence-gateway',
} as const

/**
 * 实体关系图图形
 */
export const ER_SHAPES = {
  ENTITY: 'er-entity',
  WEAK_ENTITY: 'er-weak-entity',
  RELATIONSHIP: 'er-relationship',
  IDENTIFYING_REL: 'er-identifying-relationship',
  ATTRIBUTE: 'er-attribute',
  KEY_ATTRIBUTE: 'er-key-attribute',
  MULTIVALUED: 'er-multivalued',
  DERIVED: 'er-derived',
  ASSOCIATIVE: 'er-associative',
  TOTAL_PARTICIPATION: 'er-total-participation',
} as const

/**
 * 数据流图图形
 */
export const DFD_SHAPES = {
  PROCESS: 'dfd-process',
  DATA_STORE: 'dfd-data-store',
  EXTERNAL_ENTITY: 'dfd-external-entity',
  DATA_FLOW: 'dfd-data-flow',
  MULTIPLE_PROCESS: 'dfd-multiple-process',
} as const

/**
 * 泳道图图形
 */
export const SWIMLANE_SHAPES = {
  HORIZONTAL: 'swimlane-horizontal',
  VERTICAL: 'swimlane-vertical',
  POOL: 'swimlane-pool',
  PHASE: 'swimlane-phase',
} as const

/**
 * 状态图图形
 */
export const STATE_SHAPES = {
  STATE: 'state-simple',
  INITIAL: 'state-initial',
  FINAL: 'state-final',
  SHALLOW_HISTORY: 'state-shallow-history',
  DEEP_HISTORY: 'state-deep-history',
  JUNCTION: 'state-junction',
  CHOICE: 'state-choice',
  FORK: 'state-fork',
  JOIN: 'state-join',
  ENTRY_POINT: 'state-entry-point',
  EXIT_POINT: 'state-exit-point',
  TERMINATE: 'state-terminate',
  SIGNAL_SEND: 'state-signal-send',
  SIGNAL_RECEIVE: 'state-signal-receive',
} as const

/**
 * 所有 shape 名称集合
 */
export const ALL_SHAPES = {
  ...BASIC_SHAPES,
  ...EDGE_SHAPES,
  ...FLOWCHART_SHAPES,
  ...UML_SHAPES,
  ...SEQUENCE_SHAPES,
  ...ER_SHAPES,
  ...DFD_SHAPES,
  ...SWIMLANE_SHAPES,
  ...STATE_SHAPES,
} as const

export type ShapeName = (typeof ALL_SHAPES)[keyof typeof ALL_SHAPES]

/**
 * 图形属性支持分类
 *
 * 根据图形的几何特征，判断其是否支持圆角(rx)等属性
 *
 * 判断逻辑：
 * - body 是 <rect> → 支持圆角（rect 天然有 rx/ry 属性）
 * - body 是 <polygon>（有 refPoints）→ 不支持（多边形没有圆角概念）
 * - body 是 <ellipse>/<circle> → 不支持（椭圆/圆没有圆角概念）
 * - 自定义 markup（非标准 body）→ 不支持（火柴人、线条构成等特殊图形）
 */

/**
 * 支持圆角(rx)的图形集合
 * body 为 <rect>，rx/ry 属性有实际几何意义
 */
export const RX_SUPPORTED_SHAPES: ReadonlySet<string> = new Set([
  // 基础图形 - rect 系列
  BASIC_SHAPES.RECT,
  BASIC_SHAPES.ROUNDED_RECT,
  BASIC_SHAPES.CYLINDER, // body=rect(rx=35), 圆柱体弧形效果依赖 rx
  BASIC_SHAPES.CLOUD, // body=rect(rx=30), 云朵效果依赖 rx
  BASIC_SHAPES.DOCUMENT, // body=rect，可加圆角

  // 流程图 - rect 系列
  FLOWCHART_SHAPES.START_END, // body=rect(rx=25)
  FLOWCHART_SHAPES.PROCESS, // body=rect
  FLOWCHART_SHAPES.DOCUMENT, // body=rect
  FLOWCHART_SHAPES.DATABASE, // body=rect(rx=0)
  FLOWCHART_SHAPES.PREDEFINED, // body=rect
  FLOWCHART_SHAPES.INTERNAL_STORAGE, // body=rect

  // UML - rect 系列
  UML_SHAPES.CLASS, // body=rect
  UML_SHAPES.INTERFACE, // body=rect(markup)
  UML_SHAPES.ABSTRACT, // body=rect(markup)
  UML_SHAPES.ENUM, // body=rect(markup)
  UML_SHAPES.PACKAGE, // body=rect(markup, rx=0)
  UML_SHAPES.OBJECT, // body=rect(markup, rx=0)
  UML_SHAPES.COMPONENT, // body=rect(markup, rx=0)

  // 时序图 - rect 系列
  SEQUENCE_SHAPES.ACTIVATION, // body=rect(rx=2)
  SEQUENCE_SHAPES.FRAGMENT_ALT, // body=rect(rx=2)
  SEQUENCE_SHAPES.FRAGMENT_OPT, // body=rect(rx=2)
  SEQUENCE_SHAPES.FRAGMENT_LOOP, // body=rect(rx=2)
  SEQUENCE_SHAPES.FRAGMENT_PAR, // body=rect(rx=2)
  SEQUENCE_SHAPES.FRAGMENT_CRITICAL, // body=rect(rx=2)

  // ER图 - rect 系列
  ER_SHAPES.ENTITY, // body=rect(rx=0)
  ER_SHAPES.WEAK_ENTITY, // body=rect(markup, rx=0)
  ER_SHAPES.ASSOCIATIVE, // body=rect(markup)

  // 数据流图 - rect 系列
  DFD_SHAPES.EXTERNAL_ENTITY, // body=rect(rx=0)

  // 泳道图 - rect 系列
  SWIMLANE_SHAPES.HORIZONTAL, // body=rect(rx=0)
  SWIMLANE_SHAPES.VERTICAL, // body=rect(rx=0)
  SWIMLANE_SHAPES.POOL, // body=rect(rx=0)
  SWIMLANE_SHAPES.PHASE, // body=rect(rx=0)

  // 状态图 - rect 系列
  STATE_SHAPES.STATE, // body=rect(rx=12)
  STATE_SHAPES.FORK, // body=rect(rx=0)
  STATE_SHAPES.JOIN, // body=rect(rx=0)
])

/**
 * 不支持圆角(rx)的图形集合
 * body 为 <polygon>/<ellipse>/<circle>，或自定义 markup 无 body
 */
export const RX_UNSUPPORTED_SHAPES: ReadonlySet<string> = new Set([
  // 基础图形 - polygon 系列
  BASIC_SHAPES.DIAMOND,
  BASIC_SHAPES.TRIANGLE,
  BASIC_SHAPES.PARALLELOGRAM,
  BASIC_SHAPES.TRAPEZOID,
  BASIC_SHAPES.HEXAGON,
  BASIC_SHAPES.PENTAGON,
  BASIC_SHAPES.OCTAGON,
  BASIC_SHAPES.STAR,
  BASIC_SHAPES.CROSS,
  // 基础图形 - ellipse 系列
  BASIC_SHAPES.CIRCLE,

  // 流程图 - polygon/ellipse 系列
  FLOWCHART_SHAPES.DECISION,
  FLOWCHART_SHAPES.INPUT_OUTPUT,
  FLOWCHART_SHAPES.CONNECTOR, // circle
  FLOWCHART_SHAPES.MERGE,

  // UML - ellipse/特殊
  UML_SHAPES.USE_CASE, // ellipse
  UML_SHAPES.COLLABORATION, // ellipse
  UML_SHAPES.NOTE, // body 被覆盖为 polygon
  UML_SHAPES.ACTOR, // 火柴人，无 body
  UML_SHAPES.DEPLOYMENT, // 3D立方体，多面拼接加圆角会断裂
  UML_SHAPES.NODE, // 3D立方体，同上
  UML_SHAPES.COMPOSITE, // body=rect 但内嵌 polygon 装饰
  UML_SHAPES.ARTIFACT, // body=rect 但有 path 折角装饰

  // 时序图 - polygon/特殊
  SEQUENCE_SHAPES.ACTOR, // 火柴人，无 body
  SEQUENCE_SHAPES.LIFELINE, // 无 body，header+line
  SEQUENCE_SHAPES.GATEWAY, // polygon

  // ER图 - polygon/ellipse 系列
  ER_SHAPES.RELATIONSHIP,
  ER_SHAPES.IDENTIFYING_REL,
  ER_SHAPES.ATTRIBUTE, // ellipse
  ER_SHAPES.KEY_ATTRIBUTE, // ellipse
  ER_SHAPES.MULTIVALUED, // ellipse
  ER_SHAPES.DERIVED, // ellipse
  ER_SHAPES.TOTAL_PARTICIPATION, // polygon

  // 数据流图 - circle/特殊
  DFD_SHAPES.PROCESS, // circle
  DFD_SHAPES.MULTIPLE_PROCESS, // circle
  DFD_SHAPES.DATA_STORE, // body 透明，形状由3条 line 构成

  // 状态图 - circle/polygon 系列
  STATE_SHAPES.INITIAL,
  STATE_SHAPES.FINAL,
  STATE_SHAPES.SHALLOW_HISTORY,
  STATE_SHAPES.DEEP_HISTORY,
  STATE_SHAPES.JUNCTION,
  STATE_SHAPES.CHOICE, // polygon
  STATE_SHAPES.ENTRY_POINT,
  STATE_SHAPES.EXIT_POINT,
  STATE_SHAPES.TERMINATE,
  STATE_SHAPES.SIGNAL_SEND, // polygon
  STATE_SHAPES.SIGNAL_RECEIVE, // polygon
])

/**
 * 判断图形是否支持圆角(rx)
 */
export function isShapeRxSupported(shape: string): boolean {
  return RX_SUPPORTED_SHAPES.has(shape)
}
