import type { PortsConfig } from '@uni-draw/shared'
import {
  activationPorts,
  actorPorts,
  diamondPorts,
  ellipsePorts,
  fragmentPorts,
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
    return polygonPorts(6)
  }
  if (shape === 'basic-pentagon') {
    return polygonPorts(5)
  }
  if (shape === 'basic-octagon') {
    return polygonPorts(8)
  }
  if (shape === 'basic-star') {
    return starPorts(5)
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
  if (shape === 'state-initial' || shape === 'state-final' || shape === 'state-junction'
    || shape === 'state-shallow-history' || shape === 'state-deep-history'
    || shape === 'state-entry-point' || shape === 'state-exit-point') {
    return ellipsePorts(8)
  }
  if (shape === 'state-choice' || shape === 'state-signal-send' || shape === 'state-signal-receive') {
    return diamondPorts()
  }

  // 默认矩形四边
  return rectPorts()
}
