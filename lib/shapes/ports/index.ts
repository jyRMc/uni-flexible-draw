import type { PortsConfig } from '@uni-draw/shared'
import {
  activationPorts,
  actorPorts,
  databasePorts,
  delayPorts,
  diamondPorts,
  documentPorts,
  ellipsePorts,
  forkPorts,
  fragmentPorts,
  joinPorts,
  lifelinePorts,
  multiDocumentPorts,
  polygonPorts,
  rectPorts,
  starPorts,
  storedDataPorts,
  trianglePorts,
  umlClassPorts,
  umlComponentPorts,
} from './ports'

export * from './ports'

/**
 * 根据 shape 名称获取动态连接点配置
 */
export function getShapePorts(shape: string): PortsConfig {
  // ── Basic ──
  if (shape === 'basic-circle') {
    return ellipsePorts(8)
  }
  if (shape === 'basic-diamond') {
    return diamondPorts()
  }
  if (shape === 'basic-triangle') {
    return trianglePorts()
  }
  if (shape === 'basic-hexagon') {
    return polygonPorts(6, undefined, '0.5,0 1,0.25 1,0.75 0.5,1 0,0.75 0,0.25')
  }
  if (shape === 'basic-pentagon') {
    return polygonPorts(5, undefined, '0.5,0 1,0.38 0.81,1 0.19,1 0,0.38')
  }
  if (shape === 'basic-octagon') {
    return polygonPorts(8, undefined, '0.3,0 0.7,0 1,0.3 1,0.7 0.7,1 0.3,1 0,0.7 0,0.3')
  }
  if (shape === 'basic-star') {
    return starPorts(5, undefined, '0.5,0 0.62,0.38 1,0.38 0.69,0.62 0.81,1 0.5,0.75 0.19,1 0.31,0.62 0,0.38 0.38,0.38')
  }

  // ── Flowchart ──
  if (shape === 'flowchart-decision') {
    return polygonPorts(4, undefined, '0.5,0 1,0.5 0.5,1 0,0.5')
  }
  if (shape === 'flowchart-connector') {
    return ellipsePorts(8)
  }
  if (shape === 'flowchart-merge') {
    return polygonPorts(4, undefined, '0.5,0 1,0.5 0.5,1 0,0.5')
  }
  if (shape === 'flowchart-input-output') {
    return polygonPorts(4, undefined, '0.5,0 0.93,0.5 0.5,1 0.07,0.5')
  }
  if (shape === 'flowchart-off-page-connector') {
    return polygonPorts(5, undefined, '0,0 0.9,0 1,0.5 0.9,1 0,1')
  }
  if (shape === 'flowchart-document') {
    return documentPorts()
  }
  if (shape === 'flowchart-multi-document') {
    return multiDocumentPorts()
  }
  if (shape === 'flowchart-preparation') {
    return polygonPorts(6, undefined, '0.23,0 0.77,0 1,0.5 0.77,1 0.23,1 0,0.5')
  }
  if (shape === 'flowchart-manual-operation') {
    return polygonPorts(4, undefined, '0.5,0 0.93,0.5 0.5,1 0.07,0.5')
  }
  if (shape === 'flowchart-delay') {
    return delayPorts()
  }
  if (shape === 'flowchart-display') {
    return polygonPorts(5, undefined, '0,0.5 0.13,0 1,0 1,1 0.13,1')
  }
  if (shape === 'flowchart-annotation') {
    return rectPorts()
  }
  if (shape === 'flowchart-sort') {
    return polygonPorts(3, undefined, '0.5,0 1,1 0,1')
  }
  if (shape === 'flowchart-stored-data') {
    return storedDataPorts()
  }
  if (shape === 'flowchart-database') {
    return databasePorts()
  }

  // ── UML ──
  if (shape === 'uml-class' || shape === 'uml-abstract' || shape === 'uml-interface' || shape === 'uml-enum') {
    return umlClassPorts()
  }
  if (shape === 'uml-actor') {
    return actorPorts()
  }
  if (shape === 'uml-use-case' || shape === 'uml-collaboration') {
    return ellipsePorts(8)
  }
  if (shape === 'uml-component') {
    return umlComponentPorts()
  }

  // ── Sequence ──
  if (shape === 'sequence-actor') {
    return actorPorts()
  }
  if (shape === 'sequence-lifeline') {
    return lifelinePorts()
  }
  if (shape === 'sequence-activation') {
    return activationPorts()
  }
  if (shape.startsWith('sequence-fragment')) {
    return fragmentPorts()
  }
  if (shape === 'sequence-gateway') {
    return diamondPorts()
  }

  // ── ER ──
  if (shape === 'er-relationship' || shape === 'er-identifying-relationship') {
    return polygonPorts(4, undefined, '0.5,0 1,0.5 0.5,1 0,0.5')
  }
  if (shape === 'er-associative') {
    return polygonPorts(4, undefined, '0.5, 1,0.5 0.5,1 0,0.5')
  }
  if (
    shape === 'er-attribute'
    || shape === 'er-key-attribute'
    || shape === 'er-multivalued'
    || shape === 'er-derived'
  ) {
    return ellipsePorts(8)
  }

  // ── DFD ──
  if (shape === 'dfd-process' || shape === 'dfd-multiple-process') {
    return ellipsePorts(8)
  }

  // ── State ──
  if (shape === 'state-simple' || shape === 'state-composite' || shape === 'state-submachine') {
    return rectPorts()
  }
  if (shape === 'state-initial' || shape === 'state-final') {
    return ellipsePorts(8)
  }
  if (shape === 'state-shallow-history' || shape === 'state-deep-history') {
    return rectPorts()
  }
  if (shape === 'state-choice' || shape === 'state-junction') {
    return polygonPorts(4, undefined, '0.5,0 1,0.5 0.5,1 0,0.5')
  }
  if (shape === 'state-entry-point' || shape === 'state-exit-point') {
    return rectPorts()
  }
  if (shape === 'state-signal-send') {
    return polygonPorts(
      6,
      undefined,
      '0,0.5 0.24,0 0.76,0 1,0.5 0.76,1 0.24,1',
    )
  }
  if (shape === 'state-signal-receive') {
    return polygonPorts(
      6,
      undefined,
      '0.24,0 0.76,0 1,0.5 0.76,1 0.24,1 0,0.5',
    )
  }
  if (shape === 'state-fork') {
    return forkPorts()
  }
  if (shape === 'state-join') {
    return joinPorts()
  }
  if (shape === 'state-terminate') {
    return polygonPorts(4, undefined, '0.3,0.3 0.7,0.7 0.7,0.3 0.3,0.7')
  }

  // 默认矩形四边
  return rectPorts()
}
