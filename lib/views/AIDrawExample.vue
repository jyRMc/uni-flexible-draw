<template>
  <UniDraw
    ref="drawRef"
    v-model="graphData"
    :show-ai-panel="true"
    @ai:generate="onAiGenerate"
    @ready="onReady"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { UniDraw } from '@uni-draw/draw'
import type { GraphData } from '@uni-draw/draw'
import { generateGraph, diagnoseSiliconFlow } from '../mocks/aiService'

const drawRef = ref<InstanceType<typeof UniDraw> | null>(null)

const graphData = ref<GraphData>({
  canvas: { backgroundColor: '#ffffff', grid: { size: 10, visible: true, type: 'dot' }, zoom: 1 },
  nodes: [],
  edges: [],
})

async function onReady() {
  const diag = await diagnoseSiliconFlow()
  drawRef.value?.applyAiResult(undefined, `🔌 API 连通诊断: ${diag}`, [
    '如何绘制流程图？', '如何绘制 UML 类图？', '如何绘制实体关系图？',
  ])
}

async function onAiGenerate(prompt: string, context: GraphData) {
  const streamMsgIdx = drawRef.value ? -1 : -1
  try {
    const data = await generateGraph(prompt, (_token, full) => {
      if (streamMsgIdx >= 0) return
      drawRef.value?.applyAiResult(undefined, full)
    })
    const nodes = data.nodes.map(n => n.label || n.shape).filter(Boolean)
    const summary = `已为你生成${data.meta?.title ?? '图表'}，包含 ${data.nodes.length} 个节点和 ${data.edges.length} 条边。\n\n图中包含：\n${nodes.map(n => `• ${n}`).join('\n')}`
    const followUp = data.meta?.type === 'flowchart'
      ? ['能否添加异常处理分支？', '如何将这个流程优化？']
      : ['如何扩展这个架构？', '有哪些可以优化的地方？']
    drawRef.value?.applyAiResult(data, summary, followUp)
  } catch (err) {
    drawRef.value?.applyAiResult(undefined, `生成失败：${err instanceof Error ? err.message : '未知错误'}`)
  }
  void context
}
</script>
