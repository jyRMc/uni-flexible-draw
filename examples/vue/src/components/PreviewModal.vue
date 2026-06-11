<template>
  <Teleport to="body">
    <Transition name="preview-fade">
      <div v-if="visible" class="preview-modal-mask" @click.self="onClose">
        <div class="preview-modal">
          <div class="preview-modal-header">
            <span class="preview-modal-title">{{ title }}</span>
            <div class="preview-modal-actions">
              <button class="preview-icon-btn" :title="copyTitle" @click="onCopy">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </button>
              <button class="preview-icon-btn" :title="downloadTitle" @click="onDownload">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
              <button class="preview-icon-btn" title="导出图片" @click="onExportImage">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </button>
              <button class="preview-icon-btn" :title="closeTitle" @click="onClose">✕</button>
            </div>
          </div>
          <div class="preview-modal-body">
            <FlexibleDraw
              v-if="visible"
              ref="canvasRef"
              :model-value="previewData"
              class="preview-canvas"
              readonly
              :grid="false"
              :snapline="false"
              :keyboard="false"
              :minimap="false"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { FlexibleDraw, registerAllShapes } from '@uni-draw/draw'
import type { GraphData } from '@uni-draw/draw'

export interface PreviewModalProps {
  visible: boolean
  data?: GraphData
  title?: string
  copyTitle?: string
  downloadTitle?: string
  closeTitle?: string
}

const props = withDefaults(defineProps<PreviewModalProps>(), {
  title: '预览',
  copyTitle: '复制 JSON',
  downloadTitle: '下载 JSON',
  closeTitle: '关闭',
})

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void
  (e: 'copy', data: GraphData): void
  (e: 'download', data: GraphData): void
}>()

const canvasRef = ref<InstanceType<typeof FlexibleDraw> | null>(null)

const previewData = computed<GraphData>(() => {
  const base = props.data ?? {
    canvas: { backgroundColor: '#ffffff', grid: { size: 10, visible: true, type: 'dot' as const }, zoom: 1 },
    nodes: [],
    edges: [],
  }
  // 预览时不显示画布背景（背景色设为透明，同时保留网格等其它配置）
  return {
    ...base,
    canvas: {
      ...base.canvas,
      backgroundColor: undefined,
      grid: { size: 10, visible: false, type: 'dot' as const },
    },
  }
})

// 注册图形（预览组件独立使用时需要）
watch(() => props.visible, (val) => {
  if (val) {
    registerAllShapes()
    // 等待弹窗动画及画布初始化完成后，自适应居中所有节点
    nextTick().then(() => {
      setTimeout(() => {
        canvasRef.value?.zoomToFit?.({ padding: 24 })
      }, 300)
    })
  }
}, { immediate: true })

// 数据变化且弹窗可见时，重新居中
watch(previewData, () => {
  if (props.visible) {
    nextTick().then(() => {
      setTimeout(() => {
        canvasRef.value?.zoomToFit?.({ padding: 24 })
      }, 100)
    })
  }
}, { deep: true })

function onClose() {
  emit('update:visible', false)
}

function onCopy() {
  if (props.data) {
    emit('copy', props.data)
  }
}

function onDownload() {
  if (props.data) {
    emit('download', props.data)
  }
}

async function onExportImage() {
  const url = await canvasRef.value?.exportPreviewImage?.()
  if (!url) return
  const a = document.createElement('a')
  a.href = url
  a.download = `${props.data?.meta?.title ?? 'preview'}.png`
  a.click()
}

async function exportImage(): Promise<string> {
  return canvasRef.value?.exportPreviewImage?.() ?? ''
}

defineExpose({
  exportImage,
})
</script>

<style scoped>
.preview-modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
}

.preview-modal {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.22);
  width: 960px;
  max-width: 90vw;
  height: 720px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.preview-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #e8e8e8;
  flex-shrink: 0;
}

.preview-modal-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.preview-modal-actions {
  display: flex;
  gap: 4px;
  align-items: center;
}

.preview-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 4px;
  background: none;
  cursor: pointer;
  color: #999;
  transition: all 0.15s;
  font-size: 14px;
}

.preview-icon-btn:hover {
  background: #f0f0f0;
  color: #1a1a1a;
}

.preview-modal-body {
  flex: 1;
  min-height: 0;
  position: relative;
  overflow: hidden;
  background: #fafafa;
}

.preview-canvas {
  width: 100%;
  height: 100%;
}

/* Transition */
.preview-fade-enter-active,
.preview-fade-leave-active {
  transition: opacity 0.2s ease;
}

.preview-fade-enter-active .preview-modal {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.preview-fade-leave-active .preview-modal {
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.preview-fade-enter-from,
.preview-fade-leave-to {
  opacity: 0;
}

.preview-fade-enter-from .preview-modal,
.preview-fade-leave-to .preview-modal {
  transform: scale(0.96);
  opacity: 0;
}
</style>
