import { describe, it, expect } from 'vitest'
import {
  createDefaultTableData,
  normalizeTableData,
  buildTableMarkup,
  buildTableAttrs,
} from '../shapes/basic/table'

describe('table shape helpers', () => {
  describe('createDefaultTableData', () => {
    it('should create 3x3 table by default', () => {
      const table = createDefaultTableData()
      expect(table.rows).toBe(3)
      expect(table.cols).toBe(3)
      expect(table.cells).toHaveLength(3)
      expect(table.cells[0]).toEqual(['列1', '列2', '列3'])
    })

    it('should create custom sized table', () => {
      const table = createDefaultTableData(2, 4)
      expect(table.rows).toBe(2)
      expect(table.cols).toBe(4)
      expect(table.cells[0]).toEqual(['列1', '列2', '列3', '列4'])
    })
  })

  describe('normalizeTableData', () => {
    it('should fallback to 3x3 for invalid input', () => {
      const table = normalizeTableData(null)
      expect(table.rows).toBe(3)
      expect(table.cols).toBe(3)
    })

    it('should clamp invalid row/col counts', () => {
      const table = normalizeTableData({ rows: 0, cols: -1, cells: [] })
      expect(table.rows).toBe(3)
      expect(table.cols).toBe(3)
    })

    it('should pad missing cells with defaults', () => {
      const table = normalizeTableData({ rows: 2, cols: 2, cells: [['A']] })
      expect(table.cells).toEqual([['A', '列2'], ['', '']])
    })

    it('should convert non-string values to strings', () => {
      const table = normalizeTableData({ rows: 1, cols: 2, cells: [[123, true]] })
      expect(table.cells).toEqual([['123', 'true']])
    })
  })

  describe('buildTableMarkup', () => {
    it('should include body, grid lines and cell texts', () => {
      const table = createDefaultTableData(2, 2)
      const markup = buildTableMarkup(table)
      // 1 body + 1 col + 1 row + 4 cells = 7
      expect(markup).toHaveLength(7)
      expect(markup[0]).toMatchObject({ tagName: 'rect', selector: 'body' })
    })
  })

  describe('buildTableAttrs', () => {
    it('should generate attrs for all cells', () => {
      const table = createDefaultTableData(2, 3)
      const attrs = buildTableAttrs(table)
      expect(attrs.body).toBeDefined()
      expect(attrs['cell-0-0']).toBeDefined()
      expect(attrs['cell-1-2']).toBeDefined()
    })

    it('should apply custom style', () => {
      const table = createDefaultTableData(2, 2)
      const attrs = buildTableAttrs(table, { fill: '#f00', stroke: '#00f', strokeWidth: 4 })
      expect(attrs.body.fill).toBe('#f00')
      expect(attrs.body.stroke).toBe('#00f')
      expect(attrs.body.strokeWidth).toBe(4)
    })

    it('should mark header row as bold', () => {
      const table = createDefaultTableData(2, 2)
      const attrs = buildTableAttrs(table)
      expect(attrs['cell-0-0'].fontWeight).toBe(600)
      expect(attrs['cell-1-0'].fontWeight).toBeUndefined()
    })
  })
})
