import type { Graph } from '@antv/x6'

/**
 * 对齐线工具（Snapline）
 * X6 内置能力，此处做开关封装
 */
export class SnaplineTool {
  constructor(private graph: Graph) {}

  enable(): void {
    // X6 2.x snapline 在 Graph 初始化时已配置
    // 这里预留动态开关接口
  }

  disable(): void {
    // 预留
  }
}
