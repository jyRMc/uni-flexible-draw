import { Graph } from '@antv/x6'
import { NodeRegistry, EdgeRegistry } from '@uni-draw/core'
import {
  BASIC_SHAPES,
  FLOWCHART_SHAPES,
  EDGE_SHAPES,
  UML_SHAPES,
  SEQUENCE_SHAPES,
  ER_SHAPES,
  DFD_SHAPES,
  SWIMLANE_SHAPES,
  STATE_SHAPES,
} from '@uni-draw/shared'
import * as basic from './basic'
import * as flowchart from './flowchart'
import * as edge from './edge'
import * as uml from './uml'
import * as sequence from './sequence'
import * as er from './er'
import * as dfd from './dfd'
import * as swimlane from './swimlane'
import * as state from './state'

/**
 * 一键注册所有内置图形
 */
export function registerAllShapes(): void {
  // 基础图形
  NodeRegistry.register(BASIC_SHAPES.RECT, basic.basicRect)
  NodeRegistry.register(BASIC_SHAPES.ROUNDED_RECT, basic.basicRoundedRect)
  NodeRegistry.register(BASIC_SHAPES.CIRCLE, basic.basicCircle)
  NodeRegistry.register(BASIC_SHAPES.DIAMOND, basic.basicDiamond)
  NodeRegistry.register(BASIC_SHAPES.TRIANGLE, basic.basicTriangle)
  NodeRegistry.register(BASIC_SHAPES.PARALLELOGRAM, basic.basicParallelogram)
  NodeRegistry.register(BASIC_SHAPES.TRAPEZOID, basic.basicTrapezoid)
  NodeRegistry.register(BASIC_SHAPES.HEXAGON, basic.basicHexagon)
  NodeRegistry.register(BASIC_SHAPES.CYLINDER, basic.basicCylinder)
  NodeRegistry.register(BASIC_SHAPES.PENTAGON, basic.basicPentagon)
  NodeRegistry.register(BASIC_SHAPES.OCTAGON, basic.basicOctagon)
  NodeRegistry.register(BASIC_SHAPES.STAR, basic.basicStar)
  NodeRegistry.register(BASIC_SHAPES.CROSS, basic.basicCross)
  NodeRegistry.register(BASIC_SHAPES.CLOUD, basic.basicCloud)
  NodeRegistry.register(BASIC_SHAPES.DOCUMENT, basic.basicDocument)
  NodeRegistry.register(BASIC_SHAPES.TABLE, basic.basicTable)
  NodeRegistry.register(BASIC_SHAPES.TEXT, basic.basicText)
  NodeRegistry.register(BASIC_SHAPES.IMAGE, basic.basicImage)
  NodeRegistry.register(BASIC_SHAPES.SVG, basic.basicSvg)

  // 流程图
  NodeRegistry.register(FLOWCHART_SHAPES.START_END, flowchart.flowchartStartEnd)
  NodeRegistry.register(FLOWCHART_SHAPES.PROCESS, flowchart.flowchartProcess)
  NodeRegistry.register(FLOWCHART_SHAPES.DECISION, flowchart.flowchartDecision)
  NodeRegistry.register(FLOWCHART_SHAPES.INPUT_OUTPUT, flowchart.flowchartInputOutput)
  NodeRegistry.register(FLOWCHART_SHAPES.DOCUMENT, flowchart.flowchartDocument)
  NodeRegistry.register(FLOWCHART_SHAPES.DATABASE, flowchart.flowchartDatabase)
  NodeRegistry.register(FLOWCHART_SHAPES.PREDEFINED, flowchart.flowchartPredefined)
  NodeRegistry.register(FLOWCHART_SHAPES.INTERNAL_STORAGE, flowchart.flowchartInternalStorage)
  NodeRegistry.register(FLOWCHART_SHAPES.CONNECTOR, flowchart.flowchartConnector)
  NodeRegistry.register(FLOWCHART_SHAPES.MERGE, flowchart.flowchartMerge)

  // UML 类图
  NodeRegistry.register(UML_SHAPES.CLASS, uml.umlClass)
  NodeRegistry.register(UML_SHAPES.INTERFACE, uml.umlInterface)
  NodeRegistry.register(UML_SHAPES.ABSTRACT, uml.umlAbstract)
  NodeRegistry.register(UML_SHAPES.ENUM, uml.umlEnum)
  NodeRegistry.register(UML_SHAPES.PACKAGE, uml.umlPackage)
  NodeRegistry.register(UML_SHAPES.NOTE, uml.umlNote)
  NodeRegistry.register(UML_SHAPES.ACTOR, uml.umlActor)
  NodeRegistry.register(UML_SHAPES.USE_CASE, uml.umlUseCase)
  NodeRegistry.register(UML_SHAPES.COMPONENT, uml.umlComponent)
  NodeRegistry.register(UML_SHAPES.DEPLOYMENT, uml.umlDeployment)
  NodeRegistry.register(UML_SHAPES.OBJECT, uml.umlObject)
  NodeRegistry.register(UML_SHAPES.COLLABORATION, uml.umlCollaboration)
  NodeRegistry.register(UML_SHAPES.COMPOSITE, uml.umlComposite)
  NodeRegistry.register(UML_SHAPES.NODE, uml.umlNode)
  NodeRegistry.register(UML_SHAPES.ARTIFACT, uml.umlArtifact)

  // 时序图
  NodeRegistry.register(SEQUENCE_SHAPES.ACTOR, sequence.sequenceActor)
  NodeRegistry.register(SEQUENCE_SHAPES.LIFELINE, sequence.sequenceLifeline)
  NodeRegistry.register(SEQUENCE_SHAPES.ACTIVATION, sequence.sequenceActivation)
  NodeRegistry.register(SEQUENCE_SHAPES.FRAGMENT_ALT, sequence.sequenceFragmentAlt)
  NodeRegistry.register(SEQUENCE_SHAPES.FRAGMENT_OPT, sequence.sequenceFragmentOpt)
  NodeRegistry.register(SEQUENCE_SHAPES.FRAGMENT_LOOP, sequence.sequenceFragmentLoop)
  NodeRegistry.register(SEQUENCE_SHAPES.FRAGMENT_PAR, sequence.sequenceFragmentPar)
  NodeRegistry.register(SEQUENCE_SHAPES.FRAGMENT_CRITICAL, sequence.sequenceFragmentCritical)
  NodeRegistry.register(SEQUENCE_SHAPES.GATEWAY, sequence.sequenceGateway)

  // 实体关系图
  NodeRegistry.register(ER_SHAPES.ENTITY, er.erEntity)
  NodeRegistry.register(ER_SHAPES.WEAK_ENTITY, er.erWeakEntity)
  NodeRegistry.register(ER_SHAPES.RELATIONSHIP, er.erRelationship)
  NodeRegistry.register(ER_SHAPES.IDENTIFYING_REL, er.erIdentifyingRelationship)
  NodeRegistry.register(ER_SHAPES.ATTRIBUTE, er.erAttribute)
  NodeRegistry.register(ER_SHAPES.KEY_ATTRIBUTE, er.erKeyAttribute)
  NodeRegistry.register(ER_SHAPES.MULTIVALUED, er.erMultivalued)
  NodeRegistry.register(ER_SHAPES.DERIVED, er.erDerived)
  NodeRegistry.register(ER_SHAPES.ASSOCIATIVE, er.erAssociative)
  NodeRegistry.register(ER_SHAPES.TOTAL_PARTICIPATION, er.erTotalParticipation)

  // 数据流图
  NodeRegistry.register(DFD_SHAPES.PROCESS, dfd.dfdProcess)
  NodeRegistry.register(DFD_SHAPES.DATA_STORE, dfd.dfdDataStore)
  NodeRegistry.register(DFD_SHAPES.EXTERNAL_ENTITY, dfd.dfdExternalEntity)
  NodeRegistry.register(DFD_SHAPES.MULTIPLE_PROCESS, dfd.dfdMultipleProcess)

  // 泳道图
  NodeRegistry.register(SWIMLANE_SHAPES.HORIZONTAL, swimlane.swimlaneHorizontal)
  NodeRegistry.register(SWIMLANE_SHAPES.VERTICAL, swimlane.swimlaneVertical)
  NodeRegistry.register(SWIMLANE_SHAPES.POOL, swimlane.swimlanePool)
  NodeRegistry.register(SWIMLANE_SHAPES.PHASE, swimlane.swimlanePhase)

  // 状态图
  NodeRegistry.register(STATE_SHAPES.STATE, state.stateSimple)
  NodeRegistry.register(STATE_SHAPES.INITIAL, state.stateInitial)
  NodeRegistry.register(STATE_SHAPES.FINAL, state.stateFinal)
  NodeRegistry.register(STATE_SHAPES.SHALLOW_HISTORY, state.stateShallowHistory)
  NodeRegistry.register(STATE_SHAPES.DEEP_HISTORY, state.stateDeepHistory)
  NodeRegistry.register(STATE_SHAPES.JUNCTION, state.stateJunction)
  NodeRegistry.register(STATE_SHAPES.CHOICE, state.stateChoice)
  NodeRegistry.register(STATE_SHAPES.FORK, state.stateFork)
  NodeRegistry.register(STATE_SHAPES.JOIN, state.stateJoin)
  NodeRegistry.register(STATE_SHAPES.ENTRY_POINT, state.stateEntryPoint)
  NodeRegistry.register(STATE_SHAPES.EXIT_POINT, state.stateExitPoint)
  NodeRegistry.register(STATE_SHAPES.TERMINATE, state.stateTerminate)
  NodeRegistry.register(STATE_SHAPES.SIGNAL_SEND, state.stateSignalSend)
  NodeRegistry.register(STATE_SHAPES.SIGNAL_RECEIVE, state.stateSignalReceive)

  // 边
  EdgeRegistry.register(EDGE_SHAPES.LINE, edge.edgeLine)
  EdgeRegistry.register(EDGE_SHAPES.SKETCH, edge.edgeSketch)
  EdgeRegistry.register(EDGE_SHAPES.DASHED, edge.edgeDashed)
  EdgeRegistry.register(EDGE_SHAPES.ARROW, edge.edgeArrow)
  EdgeRegistry.register(EDGE_SHAPES.DOUBLE_ARROW, edge.edgeDoubleArrow)
  EdgeRegistry.register(EDGE_SHAPES.CURVE, edge.edgeCurve)
  EdgeRegistry.register(EDGE_SHAPES.ORTHOGONAL, edge.edgeOrthogonal)
}
