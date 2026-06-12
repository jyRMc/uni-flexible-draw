import type { GraphData } from '@uni-draw/shared'

const CURRENT_VERSION = '0.0.1'

/**
 * 数据迁移
 * 处理不同版本 GraphData 之间的兼容性
 */
export class DataMigration {
  /**
   * 将数据迁移到当前版本
   */
  static migrate(data: GraphData): GraphData {
    const version = data.meta?.version ?? '0.0.0'

    if (version === CURRENT_VERSION) {
      return data
    }

    // 版本迁移链
    let migrated = { ...data }

    if (this.compareVersion(version, '0.0.1') < 0) {
      migrated = this.migrateTo001(migrated)
    }

    return migrated
  }

  /**
   * 迁移到 0.0.1
   */
  private static migrateTo001(data: GraphData): GraphData {
    return {
      ...data,
      meta: {
        ...data.meta,
        version: '0.0.1',
      },
    }
  }

  /**
   * 版本号比较
   * @returns -1: v1 < v2, 0: v1 === v2, 1: v1 > v2
   */
  private static compareVersion(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number)
    const parts2 = v2.split('.').map(Number)

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const a = parts1[i] ?? 0
      const b = parts2[i] ?? 0
      if (a < b)
        return -1
      if (a > b)
        return 1
    }
    return 0
  }
}
