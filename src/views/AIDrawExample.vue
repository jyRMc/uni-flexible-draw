<script setup lang="ts">
import { ref } from 'vue'
import { UniDraw } from '../index'
import type { GraphData } from '../index'
import { type AIConnectionConfig, diagnoseAiConnection, generateGraph } from '../mocks/aiService'
import AIPanel from './AIPanel.vue'

const drawRef = ref<InstanceType<typeof UniDraw> | null>(null)
const messages = ref<Array<{ role: 'user' | 'assistant', content: string }>>([])
const aiLoading = ref(false)
const followUpQuestions = ref<string[]>([])
const aiConfig = ref<AIConnectionConfig>({
  model: '',
  apiUrl: '',
  apiKey: '',
})

const graphData = ref<GraphData>({
  canvas: { backgroundColor: '#ffffff', grid: { size: 10, visible: true, type: 'dot' }, zoom: 1 },
  nodes: [],
  edges: [],
})

function appendAssistantMessage(content: string) {
  const lastMessage = messages.value[messages.value.length - 1]
  if (lastMessage?.role === 'assistant') {
    lastMessage.content = content
    messages.value = [...messages.value]
    return
  }
  messages.value = [...messages.value, { role: 'assistant', content }]
}

function onAiConfigChange(config: AIConnectionConfig) {
  aiConfig.value = config
}

async function onReady() {
  const diag = await diagnoseAiConnection(aiConfig.value)
  messages.value = [{ role: 'assistant', content: `🔌 API 连通诊断: ${diag}` }]
  followUpQuestions.value = [
    '如何绘制流程图？',
    '如何绘制 UML 类图？',
    '如何绘制实体关系图？',
  ]
}

async function onAiGenerate(prompt: string) {
  const normalizedPrompt = prompt.trim()
  if (!normalizedPrompt || aiLoading.value)
    return
  messages.value = [...messages.value, { role: 'user', content: normalizedPrompt }]
  aiLoading.value = true
  followUpQuestions.value = []
  try {
    const data = await generateGraph(normalizedPrompt, aiConfig.value, (_token, full) => {
      appendAssistantMessage(full)
    })
    const nodes = data.nodes.map(n => n.label || n.shape).filter(Boolean)
    const summary = `已为你生成${data.meta?.title ?? '图表'}，包含 ${data.nodes.length} 个节点和 ${data.edges.length} 条边。\n\n图中包含：\n${nodes.map(n => `• ${n}`).join('\n')}`
    const followUp = data.meta?.type === 'flowchart'
      ? ['能否添加异常处理分支？', '如何将这个流程优化？']
      : ['如何扩展这个架构？', '有哪些可以优化的地方？']
    drawRef.value?.setData?.(data)
    appendAssistantMessage(summary)
    followUpQuestions.value = followUp
  }
  catch (err) {
    appendAssistantMessage(`生成失败：${err instanceof Error ? err.message : '未知错误'}`)
  }
  finally {
    aiLoading.value = false
  }
}
</script>

<template>
  <div class="app-shell">
    <UniDraw
      ref="drawRef"
      v-model="graphData"
      class="draw-shell"
      @ready="onReady"
    />
    <AIPanel
      :messages="messages"
      :is-loading="aiLoading"
      :follow-up-questions="followUpQuestions"
      :config="aiConfig"
      class="ai-shell"
      @update:config="onAiConfigChange"
      @send="onAiGenerate"
    />
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.draw-shell {
  flex: 1;
  min-width: 0;
}

.ai-shell {
  flex-shrink: 0;
}
</style>
