import type { PortsConfig } from '@uni-draw/shared'
import {
  activationPorts,
  actorPorts,
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
  trianglePorts,
  umlClassPorts,
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
    return diamondPorts()
  }
  if (shape === 'flowchart-connector') {
    return ellipsePorts(8)
  }
  if (shape === 'flowchart-merge') {
    return diamondPorts()
  }
  if (shape === 'flowchart-input-output') {
    return polygonPorts(4, undefined, '0.1875,0.071429 0.96875,0.071429 0.84375,0.928571 0.0625,0.928571')
  }
  if (shape === 'flowchart-off-page-connector') {
    return polygonPorts(5, undefined, '0.03125,0.071429 0.875,0.071429 0.96875,0.5 0.875,0.928571 0.03125,0.928571')
  }
  if (shape === 'flowchart-document') {
    return documentPorts()
  }
  if (shape === 'flowchart-multi-document') {
    return multiDocumentPorts()
  }
  if (shape === 'flowchart-preparation') {
    return polygonPorts(6, undefined, '0.25,0.071429 0.75,0.071429 0.96875,0.5 0.75,0.928571 0.25,0.928571 0.03125,0.5')
  }
  if (shape === 'flowchart-manual-operation') {
    return polygonPorts(4, undefined, '0.03125,0.071429 0.96875,0.071429 0.84375,0.928571 0.15625,0.928571')
  }
  if (shape === 'flowchart-delay') {
    return polygonPorts(
      9,
      undefined,
      '0.3125,0.071429 0.96875,0.071429 0.96875,0.928571 0.3125,0.928571 0.21875,0.871154 0.15012,0.714286 0.125,0.5 0.15012,0.285714 0.21875,0.128846',
    )
  }
  if (shape === 'flowchart-display') {
    return polygonPorts(5, undefined, '0.03125,0.5 0.15625,0.071429 0.96875,0.071429 0.96875,0.928571 0.15625,0.928571')
  }
  if (shape === 'flowchart-annotation') {
    return rectPorts()
  }
  if (shape === 'flowchart-sort') {
    return polygonPorts(3, undefined, '0.5,0.1 0.916667,0.9 0.083333,0.9')
  }
  if (shape === 'flowchart-stored-data') {
    return polygonPorts(
      11,
      undefined,
      '0.03125,0.071429 0.84375,0.071429 0.9375,0.128846 0.976333,0.19704 1.00613,0.285714 1.03125,0.5 1.00613,0.714286 0.976333,0.80296 0.9375,0.871154 0.84375,0.928571 0.03125,0.928571',
    )
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
    return diamondPorts()
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
  if (
    shape === 'state-initial'
    || shape === 'state-final'
    || shape === 'state-shallow-history'
    || shape === 'state-deep-history'
  ) {
    return ellipsePorts(8)
  }
  if (shape === 'state-choice' || shape === 'state-junction') {
    return polygonPorts(4, undefined, '0.5,0.2 0.8,0.5 0.5,0.8 0.2,0.5')
  }
  if (shape === 'state-entry-point' || shape === 'state-exit-point') {
    return rectPorts()
  }
  if (shape === 'state-signal-send') {
    return polygonPorts(
      6,
      undefined,
      '0.03125,0.5 0.25,0.071428571 0.75,0.071428571 0.96875,0.5 0.75,0.928571429 0.25,0.928571429',
    )
  }
  if (shape === 'state-signal-receive') {
    return polygonPorts(
      6,
      undefined,
      '0.25,0.071428571 0.75,0.071428571 0.96875,0.5 0.75,0.928571429 0.25,0.928571429 0.03125,0.5',
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
