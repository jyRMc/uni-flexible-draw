/**
 * 连接线各维度图标系统
 *
 * 覆盖 Router / Connector / Marker / StrokeStyle 四个维度
 */
import { icons } from '../../assets/icons'
import type {
  ConnectorName,
  MarkerName,
  RouterName,
} from '../types/edge'
import type { StrokeStyleName } from './edgeLine'

export interface EdgeOptionIcon {
  value: string
  title: string
  svg: string
}

// ─── Connector 图标 ────────────────────────────────────────────────────

export function getConnectorIconSvg(name: ConnectorName): string {
  const map: Record<string, string> = {
    smooth: 'connector/smooth',
    rounded: 'connector/rounded',
    jumpover: 'connector/jumpover',
    quadratic: 'connector/quadratic',
    wobble: 'connector/wobble',
    normal: 'connector/normal',
  }
  return icons[map[name] ?? 'connector/normal']
}

export function getConnectorOptions(labels?: Partial<Record<ConnectorName, string>>): EdgeOptionIcon[] {
  return [
    { value: 'normal', title: labels?.normal ?? '直线', svg: getConnectorIconSvg('normal') },
    { value: 'smooth', title: labels?.smooth ?? '平滑曲线', svg: getConnectorIconSvg('smooth') },
    { value: 'rounded', title: labels?.rounded ?? '圆角', svg: getConnectorIconSvg('rounded') },
    { value: 'quadratic', title: labels?.quadratic ?? '二次贝塞尔', svg: getConnectorIconSvg('quadratic') },
    { value: 'jumpover', title: labels?.jumpover ?? '跳线', svg: getConnectorIconSvg('jumpover') },
    { value: 'wobble', title: labels?.wobble ?? '摇摆线', svg: getConnectorIconSvg('wobble') },
  ]
}

// ─── Router 图标 ───────────────────────────────────────────────────────

export function getRouterIconSvg(name: RouterName): string {
  const map: Record<string, string> = {
    orth: 'router/orth',
    manhattan: 'router/manhattan',
    er: 'router/er',
    metro: 'router/metro',
    oneSide: 'router/one-side',
    normal: 'router/normal',
  }
  return icons[map[name] ?? 'router/normal']
}

export function getRouterOptions(labels?: Partial<Record<RouterName, string>>): EdgeOptionIcon[] {
  return [
    { value: 'normal', title: labels?.normal ?? '默认', svg: getRouterIconSvg('normal') },
    { value: 'orth', title: labels?.orth ?? '正交', svg: getRouterIconSvg('orth') },
    { value: 'manhattan', title: labels?.manhattan ?? '曼哈顿', svg: getRouterIconSvg('manhattan') },
    { value: 'er', title: labels?.er ?? 'ER关系', svg: getRouterIconSvg('er') },
    { value: 'metro', title: labels?.metro ?? '地铁', svg: getRouterIconSvg('metro') },
    { value: 'oneSide', title: labels?.oneSide ?? '单侧', svg: getRouterIconSvg('oneSide') },
  ]
}

// ─── Marker 图标 ───────────────────────────────────────────────────────

export function getMarkerIconSvg(name: MarkerName | 'none'): string {
  const map: Record<string, string> = {
    block: 'marker/block',
    classic: 'marker/classic',
    diamond: 'marker/diamond',
    cross: 'marker/cross',
    circle: 'marker/circle',
    circlePlus: 'marker/circle-plus',
    ellipse: 'marker/ellipse',
    async: 'marker/async',
    path: 'marker/path',
    none: 'marker/none',
  }
  return icons[map[name] ?? 'marker/none']
}

export function getMarkerOptions(labels?: Partial<Record<string, string>>): EdgeOptionIcon[] {
  return [
    { value: 'none', title: labels?.none ?? '无', svg: getMarkerIconSvg('none') },
    { value: 'classic', title: labels?.classic ?? '经典箭头', svg: getMarkerIconSvg('classic') },
    { value: 'block', title: labels?.block ?? '实心三角', svg: getMarkerIconSvg('block') },
    { value: 'diamond', title: labels?.diamond ?? '菱形', svg: getMarkerIconSvg('diamond') },
    { value: 'circle', title: labels?.circle ?? '圆点', svg: getMarkerIconSvg('circle') },
    { value: 'circlePlus', title: labels?.circlePlus ?? '圆加', svg: getMarkerIconSvg('circlePlus') },
    { value: 'ellipse', title: labels?.ellipse ?? '椭圆', svg: getMarkerIconSvg('ellipse') },
    { value: 'cross', title: labels?.cross ?? '十字', svg: getMarkerIconSvg('cross') },
    { value: 'async', title: labels?.async ?? '异步箭头', svg: getMarkerIconSvg('async') },
  ]
}

// ─── StrokeStyle 图标 ──────────────────────────────────────────────────

export function getStrokeStyleIconSvg(name: StrokeStyleName): string {
  const map: Record<string, string> = {
    dashed: 'stroke-style/dashed',
    dotted: 'stroke-style/dotted',
    dashdot: 'stroke-style/dashdot',
    solid: 'stroke-style/solid',
  }
  return icons[map[name] ?? 'stroke-style/solid']
}

export function getStrokeStyleOptions(labels?: Partial<Record<StrokeStyleName, string>>): EdgeOptionIcon[] {
  return [
    { value: 'solid', title: labels?.solid ?? '实线', svg: getStrokeStyleIconSvg('solid') },
    { value: 'dashed', title: labels?.dashed ?? '虚线', svg: getStrokeStyleIconSvg('dashed') },
    { value: 'dotted', title: labels?.dotted ?? '点线', svg: getStrokeStyleIconSvg('dotted') },
    { value: 'dashdot', title: labels?.dashdot ?? '点划线', svg: getStrokeStyleIconSvg('dashdot') },
  ]
}

// ─── LineType 图标（Router + Connector 组合预设）─────────────────────────

export function getLineTypeIconSvg(name: string): string {
  const map: Record<string, string> = {
    curve: 'connector/smooth',
    rounded: 'connector/rounded',
    orthogonal: 'router/orth',
    manhattan: 'router/manhattan',
    jumpover: 'connector/jumpover',
    straight: 'connector/normal',
  }
  return icons[map[name] ?? 'connector/normal']
}

export function getLineTypeOptions(labels?: Record<string, string>): EdgeOptionIcon[] {
  return [
    { value: 'straight', title: labels?.straight ?? '直线', svg: getLineTypeIconSvg('straight') },
    { value: 'curve', title: labels?.curve ?? '曲线', svg: getLineTypeIconSvg('curve') },
    { value: 'rounded', title: labels?.rounded ?? '圆角折线', svg: getLineTypeIconSvg('rounded') },
    { value: 'orthogonal', title: labels?.orthogonal ?? '正交折线', svg: getLineTypeIconSvg('orthogonal') },
    { value: 'manhattan', title: labels?.manhattan ?? '曼哈顿', svg: getLineTypeIconSvg('manhattan') },
    { value: 'jumpover', title: labels?.jumpover ?? '跳线', svg: getLineTypeIconSvg('jumpover') },
  ]
}

// ─── 旧版兼容（getEdgeLineTypeIconSvg / getEdgeLineTypeOptions）──────────

export { getConnectorIconSvg as getEdgeLineTypeIconSvg, getConnectorOptions as getEdgeLineTypeOptions }
