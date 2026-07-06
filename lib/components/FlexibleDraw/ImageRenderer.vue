<script setup lang="ts">
import { ref, watch, toRef, nextTick, onMounted, useTemplateRef } from 'vue'
import type { CanvasConfig, GraphData } from '@uni-draw/shared'
import { useCanvas } from '../../composables/useCanvas'
import FlexibleDraw from "./FlexibleDraw.vue"
defineOptions({ inheritAttrs: false })

const props = defineProps<{
  modelValue: GraphData
  canvasConfig?: CanvasConfig
}>()

const imgSrc = ref('')
const canvasRef = useTemplateRef<InstanceType<typeof FlexibleDraw>>('canvasRef')

const canvas = useCanvas({
  modelValue: toRef(props, 'modelValue'),
  canvasConfig: (props.canvasConfig || {}) as any,
  readonly: true,
  minimap: false,
  grid: false,
  snapline: false,
  keyboard: false,
  onDataChange: () => {},
})
const emit = defineEmits(['ready'])
/** 将 X6 画布导出为 Base64 PNG */
async function exportImage(): Promise<string> {
  if (!canvasRef.value) return ''

  await nextTick()
  // 预留 X6 渲染完成的时间窗口
  await new Promise(resolve => setTimeout(resolve, 100))
  
  try {
    return await canvasRef.value.toPNG({
      padding: 16,
      backgroundColor: props.canvasConfig?.background || '#ffffff',
      quality: 2
    })
  } catch (err) {
    console.error('[X6ImageRenderer] Export failed:', err)
    return ''
  }
}

/** 刷新图片 */
async function refresh() {
  imgSrc.value = ''
  await nextTick()
  imgSrc.value = await exportImage()
  await nextTick()
  emit('ready')
}

// 数据变化时自动重绘
watch(() => props.modelValue, async () => {
  canvas.setData(props.modelValue)
  await refresh()
}, { deep: true, immediate: true })

// 画布配置变化时自动重绘
watch(() => props.canvasConfig, async () => {
  await refresh()
}, { deep: true })

onMounted(async () => {
  canvasRef.value?.zoomToFit()
  await nextTick()
  refresh()
})

defineExpose({
  getData: canvas.getData,
  setData: canvas.setData,
  toJSON: canvas.toJSON,
  fromJSON: canvas.fromJSON,
  toPNG: canvas.toPNG,
  toSVG: canvas.toSVG,
  refresh,
})
</script>

<template>
  <div class="x6-image-renderer">
    <img
      v-if="imgSrc"
      :src="imgSrc"
      alt="graph"
      class="graph-image"
    />
    <!-- 离屏渲染容器：X6 在此初始化并渲染，对用户不可见 -->
    <FlexibleDraw
      v-else
      ref="canvasRef"
      :model-value="modelValue"
      class="pointer-events-none relative inset-0 w-full h-[500px]"
      readonly
      :grid="false"
      :snapline="false"
      :keyboard="false"
      :minimap="false"
    />
  </div>
</template>

<style scoped>
.x6-image-renderer {
  position: relative;
  width: 100%;
  height: fit-content;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.graph-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
}

.hidden-canvas {
  position: fixed;
  left: -99999px;
  top: -99999px;
  width: 2000px;
  height: 2000px;
  overflow: hidden;
  visibility: hidden;
  pointer-events: none;
}
</style>
