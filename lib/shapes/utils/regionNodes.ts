import type { RegionData } from '@uni-draw/shared'

const MULTI_REGION_SHAPES = new Set([
  'uml-class',
  'uml-abstract',
  'uml-interface',
  'uml-enum',
  'sequence-fragment-alt',
  'sequence-fragment-par',
  'swimlane-horizontal',
  'swimlane-vertical',
  'swimlane-pool',
])

export function isMultiRegionShape(shape: string): boolean {
  return MULTI_REGION_SHAPES.has(shape)
}

export function getDefaultRegionData(shape: string): RegionData | undefined {
  if (shape === 'uml-class') {
    return {
      regions: [
        { id: 'name', label: 'ClassName' },
        { id: 'attributes', label: '' },
        { id: 'methods', label: '' },
      ],
      dividers: [
        { id: 'divider1', position: 0.3 },
        { id: 'divider2', position: 0.62 },
      ],
    }
  }
  if (shape === 'uml-abstract') {
    return {
      regions: [
        { id: 'stereotype', label: 'abstract' },
        { id: 'name', label: 'AbstractClass' },
      ],
      dividers: [
        { id: 'divider1', position: 0.25 },
      ],
    }
  }
  if (shape === 'uml-interface') {
    return {
      regions: [
        { id: 'stereotype', label: 'interface' },
        { id: 'name', label: 'Interface' },
      ],
      dividers: [
        { id: 'divider1', position: 0.3 },
      ],
    }
  }
  if (shape === 'uml-enum') {
    return {
      regions: [
        { id: 'stereotype', label: 'enumeration' },
        { id: 'name', label: 'Enum' },
      ],
      dividers: [
        { id: 'divider1', position: 0.25 },
      ],
    }
  }
  if (shape === 'sequence-fragment-alt' || shape === 'sequence-fragment-par') {
    return {
      regions: [
        { id: 'top', label: '' },
        { id: 'bottom', label: '' },
      ],
      dividers: [
        { id: 'divider1', position: 0.5 },
      ],
    }
  }
  if (shape === 'swimlane-horizontal') {
    return {
      regions: [
        { id: 'header', label: 'Lane' },
        { id: 'body', label: '' },
      ],
      dividers: [
        { id: 'divider1', position: 0.2 },
      ],
    }
  }
  if (shape === 'swimlane-vertical') {
    return {
      regions: [
        { id: 'header', label: 'Lane' },
        { id: 'body', label: '' },
      ],
      dividers: [
        { id: 'divider1', position: 0.1 },
      ],
    }
  }
  if (shape === 'swimlane-pool') {
    return {
      regions: [
        { id: 'header', label: 'Pool' },
        { id: 'body', label: '' },
      ],
      dividers: [
        { id: 'divider1', position: 0.075 },
      ],
    }
  }
  return undefined
}

/**
 * 为多区域节点构建动态 attrs
 */
export function buildMultiRegionAttrs(shape: string, regionData: RegionData): Record<string, any> | undefined {
  const { regions, dividers } = regionData

  if (shape === 'uml-class') {
    const d1 = dividers[0]?.position ?? 0.3
    const d2 = dividers[1]?.position ?? 0.62
    return {
      body: { refWidth: 1, refHeight: 1, fill: '#ffffff', stroke: '#333333', strokeWidth: 1.5, rx: 0, ry: 0 },
      divider1: { refX: 0, refY: d1, refWidth: 1, refHeight: 0.014, fill: '#333333', stroke: 'none' },
      divider2: { refX: 0, refY: d2, refWidth: 1, refHeight: 0.014, fill: '#333333', stroke: 'none' },
      nameLabel: {
        text: regions[0]?.label ?? '',
        fill: '#333333',
        fontSize: 13,
        fontWeight: 'bold',
        refX: 0.5,
        refY: d1 / 2,
        textAnchor: 'middle',
        textVerticalAnchor: 'middle',
      },
      attrsLabel: {
        text: regions[1]?.label ?? '',
        fill: '#333333',
        fontSize: 12,
        refX: 0.5,
        refY: d1 + (d2 - d1) / 2,
        textAnchor: 'middle',
        textVerticalAnchor: 'middle',
      },
      methodsLabel: {
        text: regions[2]?.label ?? '',
        fill: '#333333',
        fontSize: 12,
        refX: 0.5,
        refY: d2 + (1 - d2) / 2,
        textAnchor: 'middle',
        textVerticalAnchor: 'middle',
      },
    }
  }

  if (shape === 'uml-abstract') {
    const d1 = dividers[0]?.position ?? 0.25
    return {
      body: { refWidth: 1, refHeight: 1, fill: '#ffffff', stroke: '#333333', strokeWidth: 1.5 },
      stereotypeLabel: {
        text: `\u00AB${regions[0]?.label ?? 'abstract'}\u00BB`,
        fill: '#666',
        fontSize: 10,
        refX: 0.5,
        refY: d1 / 2,
        textAnchor: 'middle',
        textVerticalAnchor: 'middle',
      },
      divider1: { refX: 0, refY: d1, refWidth: 1, refHeight: 0.01, fill: '#333333', stroke: 'none' },
      nameLabel: {
        text: regions[1]?.label ?? '',
        fill: '#333333',
        fontSize: 13,
        fontStyle: 'italic',
        refX: 0.5,
        refY: d1 + (1 - d1) / 2,
        textAnchor: 'middle',
        textVerticalAnchor: 'middle',
      },
    }
  }

  if (shape === 'uml-interface') {
    const d1 = dividers[0]?.position ?? 0.3
    return {
      body: { refWidth: 1, refHeight: 1, fill: '#ffffff', stroke: '#333333', strokeWidth: 1.5 },
      stereotypeLabel: {
        text: `\u00AB${regions[0]?.label ?? 'interface'}\u00BB`,
        fill: '#666',
        fontSize: 10,
        refX: 0.5,
        refY: d1 / 2,
        textAnchor: 'middle',
        textVerticalAnchor: 'middle',
      },
      divider1: { refX: 0, refY: d1, refWidth: 1, refHeight: 0.01, fill: '#333333', stroke: 'none' },
      nameLabel: {
        text: regions[1]?.label ?? '',
        fill: '#333333',
        fontSize: 13,
        refX: 0.5,
        refY: d1 + (1 - d1) / 2,
        textAnchor: 'middle',
        textVerticalAnchor: 'middle',
      },
    }
  }

  if (shape === 'uml-enum') {
    const d1 = dividers[0]?.position ?? 0.25
    return {
      body: { refWidth: 1, refHeight: 1, fill: '#ffffff', stroke: '#333333', strokeWidth: 1.5 },
      stereotypeLabel: {
        text: `\u00AB${regions[0]?.label ?? 'enumeration'}\u00BB`,
        fill: '#666',
        fontSize: 10,
        refX: 0.5,
        refY: d1 / 2,
        textAnchor: 'middle',
        textVerticalAnchor: 'middle',
      },
      divider1: { refX: 0, refY: d1, refWidth: 1, refHeight: 0.01, fill: '#333333', stroke: 'none' },
      nameLabel: {
        text: regions[1]?.label ?? '',
        fill: '#333333',
        fontSize: 13,
        refX: 0.5,
        refY: d1 + (1 - d1) / 2,
        textAnchor: 'middle',
        textVerticalAnchor: 'middle',
      },
    }
  }

  if (shape === 'sequence-fragment-alt' || shape === 'sequence-fragment-par') {
    const d1 = dividers[0]?.position ?? 0.5
    return {
      body: { fill: '#fff', stroke: '#999', strokeWidth: 1.5, rx: 2, ry: 2 },
      divider1: { refX: 0, refY: d1, refWidth: 1, refHeight: 0.005, fill: '#999', stroke: 'none', strokeDasharray: '4 2' },
      topLabel: {
        text: regions[0]?.label ?? '',
        fill: '#333',
        fontSize: 11,
        refX: 0.5,
        refY: d1 / 2,
        textAnchor: 'middle',
        textVerticalAnchor: 'middle',
      },
      bottomLabel: {
        text: regions[1]?.label ?? '',
        fill: '#333',
        fontSize: 11,
        refX: 0.5,
        refY: d1 + (1 - d1) / 2,
        textAnchor: 'middle',
        textVerticalAnchor: 'middle',
      },
    }
  }

  if (shape === 'swimlane-horizontal') {
    const d1 = dividers[0]?.position ?? 0.2
    return {
      body: { fill: '#fafafa', stroke: '#999', strokeWidth: 1, rx: 0, ry: 0 },
      header: { refX: 0, refY: 0, refWidth: d1, refHeight: 1, fill: '#f0f0f0', stroke: '#999', strokeWidth: 1 },
      divider1: { refX: d1, refY: 0, refWidth: 0.005, refHeight: 1, fill: '#999', stroke: 'none' },
      label: {
        text: regions[0]?.label ?? '',
        fill: '#333',
        fontSize: 12,
        refX: d1 / 2,
        refY: 0.5,
        textAnchor: 'middle',
        textVerticalAnchor: 'middle',
        writingMode: 'vertical-rl',
      },
    }
  }

  if (shape === 'swimlane-vertical') {
    const d1 = dividers[0]?.position ?? 0.1
    return {
      body: { fill: '#fafafa', stroke: '#999', strokeWidth: 1, rx: 0, ry: 0 },
      header: { refX: 0, refY: 0, refWidth: 1, refHeight: d1, fill: '#f0f0f0', stroke: '#999', strokeWidth: 1 },
      divider1: { refX: 0, refY: d1, refWidth: 1, refHeight: 0.005, fill: '#999', stroke: 'none' },
      label: {
        text: regions[0]?.label ?? '',
        fill: '#333',
        fontSize: 12,
        refX: 0.5,
        refY: d1 / 2,
        textAnchor: 'middle',
        textVerticalAnchor: 'middle',
      },
    }
  }

  if (shape === 'swimlane-pool') {
    const d1 = dividers[0]?.position ?? 0.075
    return {
      body: { fill: '#fafafa', stroke: '#666', strokeWidth: 1.5, rx: 0, ry: 0 },
      header: { refX: 0, refY: 0, refWidth: d1, refHeight: 1, fill: '#e0e0e0', stroke: '#666', strokeWidth: 1 },
      divider1: { refX: d1, refY: 0, refWidth: 0.005, refHeight: 1, fill: '#666', stroke: 'none' },
      label: {
        text: regions[0]?.label ?? '',
        fill: '#333',
        fontSize: 13,
        fontWeight: 'bold',
        refX: d1 / 2,
        refY: 0.5,
        textAnchor: 'middle',
        textVerticalAnchor: 'middle',
        writingMode: 'vertical-rl',
      },
    }
  }

  return undefined
}

/**
 * 获取多区域节点的 markup 配置
 */
export function getMultiRegionMarkup(shape: string): Array<{ tagName: string, selector: string }> | undefined {
  if (shape === 'uml-class') {
    return [
      { tagName: 'rect', selector: 'body' },
      { tagName: 'rect', selector: 'divider1', attrs: { 'data-selector': 'divider1' } },
      { tagName: 'rect', selector: 'divider2', attrs: { 'data-selector': 'divider2' } },
      { tagName: 'text', selector: 'nameLabel', attrs: { 'data-selector': 'nameLabel' } },
      { tagName: 'text', selector: 'attrsLabel', attrs: { 'data-selector': 'attrsLabel' } },
      { tagName: 'text', selector: 'methodsLabel', attrs: { 'data-selector': 'methodsLabel' } },
    ]
  }
  if (shape === 'uml-abstract' || shape === 'uml-interface' || shape === 'uml-enum') {
    return [
      { tagName: 'rect', selector: 'body' },
      { tagName: 'text', selector: 'stereotypeLabel' },
      { tagName: 'rect', selector: 'divider1' },
      { tagName: 'text', selector: 'nameLabel' },
    ]
  }
  if (shape === 'sequence-fragment-alt' || shape === 'sequence-fragment-par') {
    return [
      { tagName: 'rect', selector: 'body' },
      { tagName: 'rect', selector: 'tab' },
      { tagName: 'text', selector: 'tabLabel' },
      { tagName: 'rect', selector: 'divider1' },
      { tagName: 'text', selector: 'topLabel' },
      { tagName: 'text', selector: 'bottomLabel' },
    ]
  }
  if (shape === 'swimlane-horizontal' || shape === 'swimlane-vertical' || shape === 'swimlane-pool') {
    return [
      { tagName: 'rect', selector: 'body' },
      { tagName: 'rect', selector: 'header' },
      { tagName: 'rect', selector: 'divider1' },
      { tagName: 'text', selector: 'label' },
    ]
  }
  return undefined
}
