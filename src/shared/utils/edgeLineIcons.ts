export interface EdgeLineOptionIcon {
  value: string
  title: string
  svg: string
}

function wrapSvg(viewBox: string, body: string): string {
  return `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`
}

export function getEdgeLineTypeIconSvg(lineType: string): string {
  switch (lineType) {
    case 'curve':
      return wrapSvg('0 0 44 22', '<path d="M4,7 C11,7 11,17 22,17 C33,17 33,7 40,7"/>')
    case 'rounded':
      return wrapSvg('0 0 44 28', '<path d="M4,22 L18,22 Q21,22 21,19 L21,9 Q21,6 24,6 L40,6"/>')
    case 'orthogonal':
      return wrapSvg('0 0 44 28', '<polyline points="4,22 22,22 22,6 40,6"/>')
    case 'manhattan':
      return wrapSvg('0 0 44 28', '<polyline points="4,22 14,22 14,14 30,14 30,6 40,6"/>')
    case 'jumpover':
      return wrapSvg('0 0 44 24', '<path d="M4,16 H16 C18,16 18,8 20,8 C22,8 22,16 24,16 H40"/>')
    case 'straight':
    default:
      return wrapSvg('0 0 44 16', '<line x1="4" y1="8" x2="40" y2="8"/>')
  }
}

export function getEdgeLineTypeOptions(labels?: Partial<Record<string, string>>): EdgeLineOptionIcon[] {
  return [
    {
      value: 'straight',
      title: labels?.straight ?? '直线',
      svg: getEdgeLineTypeIconSvg('straight'),
    },
    {
      value: 'curve',
      title: labels?.curve ?? '曲线',
      svg: getEdgeLineTypeIconSvg('curve'),
    },
    {
      value: 'rounded',
      title: labels?.rounded ?? '圆角折线',
      svg: getEdgeLineTypeIconSvg('rounded'),
    },
    {
      value: 'orthogonal',
      title: labels?.orthogonal ?? '正交折线',
      svg: getEdgeLineTypeIconSvg('orthogonal'),
    },
    {
      value: 'manhattan',
      title: labels?.manhattan ?? '曼哈顿',
      svg: getEdgeLineTypeIconSvg('manhattan'),
    },
    {
      value: 'jumpover',
      title: labels?.jumpover ?? '跨线',
      svg: getEdgeLineTypeIconSvg('jumpover'),
    },
  ]
}
