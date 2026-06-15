import type { PortsConfig } from '@uni-draw/shared'
import {
  activationPorts,
  actorPorts,
  diamondPorts,
  ellipsePorts,
  forkPorts,
  fragmentPorts,
  joinPorts,
  lifelinePorts,
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
    return trianglePorts()
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
  if (shape === 'er-attribute' || shape === 'er-key-attribute' || shape === 'er-multivalued' || shape === 'er-derived') {
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
  if (shape === 'state-initial' || shape === 'state-final'
    || shape === 'state-shallow-history' || shape === 'state-deep-history') {
    return ellipsePorts(8)
  }
  if (shape === 'state-choice' || shape === 'state-junction') {
    return polygonPorts(4, undefined, '0.5,0.2 0.8,0.5 0.5,0.8 0.2,0.5')
  }
  if (shape === 'state-entry-point' || shape === 'state-exit-point') {
    return rectPorts()
  }
  if (shape === 'state-signal-send') {
    return polygonPorts(6, undefined, '0.03125,0.5 0.25,0.071428571 0.75,0.071428571 0.96875,0.5 0.75,0.928571429 0.25,0.928571429')
  }
  if (shape === 'state-signal-receive') {
    return polygonPorts(6, undefined, '0.25,0.071428571 0.75,0.071428571 0.96875,0.5 0.75,0.928571429 0.25,0.928571429 0.03125,0.5')
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
