import type { Node } from '@antv/x6'
import { PRIMARY_COLOR } from '../theme'

export interface TableShapeData {
  rows: number
  cols: number
  cells: string[][]
}

export interface TableShapeStyle {
  fill?: string
  stroke?: string
  strokeWidth?: number
  strokeDasharray?: string
  opacity?: number
}

function clampCount(value: unknown, fallback: number): number {
  const num = Number(value)
  return Number.isFinite(num) && num >= 1 ? Math.floor(num) : fallback
}

export function createDefaultTableData(rows = 3, cols = 3): TableShapeData {
  return {
    rows,
    cols,
    cells: Array.from({ length: rows }, (_, rowIndex) => (
      Array.from({ length: cols }, (_, colIndex) => (rowIndex === 0 ? `列${colIndex + 1}` : ''))
    )),
  }
}

export function normalizeTableData(raw: unknown): TableShapeData {
  const source = (raw && typeof raw === 'object') ? raw as Partial<TableShapeData> : {}
  const rows = clampCount(source.rows, 3)
  const cols = clampCount(source.cols, 3)
  const cells = Array.isArray(source.cells) ? source.cells : []
  return {
    rows,
    cols,
    cells: Array.from({ length: rows }, (_, rowIndex) => {
      const row = Array.isArray(cells[rowIndex]) ? cells[rowIndex] as unknown[] : []
      return Array.from({ length: cols }, (_, colIndex) => {
        const value = row[colIndex]
        if (typeof value === 'string')
          return value
        if (value == null)
          return rowIndex === 0 ? `列${colIndex + 1}` : ''
        return String(value)
      })
    }),
  }
}

export function buildTableMarkup(table: TableShapeData): Node.Config['markup'] {
  const markup: NonNullable<Node.Config['markup']> = [{ tagName: 'rect', selector: 'body' }]
  for (let col = 1; col < table.cols; col += 1) {
    markup.push({ tagName: 'path', selector: `grid-col-${col}` })
  }
  for (let row = 1; row < table.rows; row += 1) {
    markup.push({ tagName: 'path', selector: `grid-row-${row}` })
  }
  for (let row = 0; row < table.rows; row += 1) {
    for (let col = 0; col < table.cols; col += 1) {
      markup.push({ tagName: 'text', selector: `cell-${row}-${col}` })
    }
  }
  return markup
}

export function buildTableAttrs(table: TableShapeData, style: TableShapeStyle = {}): Node.Config['attrs'] {
  const fill = style.fill ?? '#ffffff'
  const stroke = style.stroke ?? PRIMARY_COLOR
  const strokeWidth = style.strokeWidth ?? 2
  const strokeDasharray = style.strokeDasharray ?? ''
  const opacity = style.opacity
  const gridStrokeWidth = Math.max(strokeWidth - 0.5, 1)
  const fontSize = table.rows >= 6 || table.cols >= 5 ? 11 : 12
  const attrs: Record<string, any> = {
    body: {
      refWidth: 1,
      refHeight: 1,
      fill,
      stroke,
      strokeWidth,
      ...(strokeDasharray ? { strokeDasharray } : {}),
      ...(opacity != null ? { opacity } : {}),
    },
  }
  for (let col = 1; col < table.cols; col += 1) {
    attrs[`grid-col-${col}`] = {
      refD: `M ${(col / table.cols).toFixed(4)} 0 L ${(col / table.cols).toFixed(4)} 1`,
      fill: 'none',
      stroke,
      strokeWidth: gridStrokeWidth,
      ...(strokeDasharray ? { strokeDasharray } : {}),
      ...(opacity != null ? { opacity } : {}),
    }
  }
  for (let row = 1; row < table.rows; row += 1) {
    attrs[`grid-row-${row}`] = {
      refD: `M 0 ${(row / table.rows).toFixed(4)} L 1 ${(row / table.rows).toFixed(4)}`,
      fill: 'none',
      stroke,
      strokeWidth: gridStrokeWidth,
      ...(strokeDasharray ? { strokeDasharray } : {}),
      ...(opacity != null ? { opacity } : {}),
    }
  }
  for (let row = 0; row < table.rows; row += 1) {
    for (let col = 0; col < table.cols; col += 1) {
      attrs[`cell-${row}-${col}`] = {
        text: table.cells[row]?.[col] ?? '',
        refX: (col + 0.5) / table.cols,
        refY: (row + 0.5) / table.rows,
        textAnchor: 'middle',
        textVerticalAnchor: 'middle',
        fill: '#333333',
        fontSize,
        ...(row === 0 ? { fontWeight: 600 } : {}),
      }
    }
  }
  return attrs
}

const defaultTableData = createDefaultTableData()

export const basicTable: Node.Config = {
  inherit: 'rect',
  width: 240,
  height: 120,
  markup: buildTableMarkup(defaultTableData),
  attrs: buildTableAttrs(defaultTableData),
  ports: {
    groups: {
      top: { position: 'top', attrs: { circle: { r: 4, magnet: true, stroke: PRIMARY_COLOR, fill: '#fff' } } },
      bottom: { position: 'bottom', attrs: { circle: { r: 4, magnet: true, stroke: PRIMARY_COLOR, fill: '#fff' } } },
      left: { position: 'left', attrs: { circle: { r: 4, magnet: true, stroke: PRIMARY_COLOR, fill: '#fff' } } },
      right: { position: 'right', attrs: { circle: { r: 4, magnet: true, stroke: PRIMARY_COLOR, fill: '#fff' } } },
    },
    items: [
      { id: 'top', group: 'top' },
      { id: 'bottom', group: 'bottom' },
      { id: 'left', group: 'left' },
      { id: 'right', group: 'right' },
    ],
  },
}
