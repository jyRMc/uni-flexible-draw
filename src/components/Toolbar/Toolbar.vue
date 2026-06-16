<script setup lang="ts">
import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignHorizontalSpaceBetween,
  AlignStartHorizontal,
  AlignStartVertical,
  AlignVerticalSpaceBetween,
  Brush,
  FileCode,
  FileJson,
  Group,
  Hand,
  ImageDown,
  Maximize2,
  MousePointer2,
  PanelLeftClose,
  PanelLeftOpen,
  PenLine,
  Redo2,
  Trash2,
  Undo2,
  Ungroup,
  ZoomIn,
  ZoomOut,
} from 'lucide-vue-next'
import { useLocale } from '../../locale'

export interface ToolbarProps {
  zoom?: number
  canUndo?: boolean
  canRedo?: boolean
  leftPanelVisible?: boolean
  panMode?: boolean
  sketchMode?: boolean
  drawMode?: boolean
  selectionCount?: number
  canGroup?: boolean
  canUngroup?: boolean
}

withDefaults(defineProps<ToolbarProps>(), {
  zoom: 1,
  canUndo: false,
  canRedo: false,
  leftPanelVisible: true,
  panMode: false,
  sketchMode: false,
  drawMode: false,
  selectionCount: 0,
  canGroup: false,
  canUngroup: false,
})

const emit = defineEmits<{
  (e: 'action', action: string): void
}>()

const t = useLocale()

function emitAction(action: string) {
  emit('action', action)
}
</script>

<template>
  <div class="toolbar-float">
    <button class="tb-btn" :disabled="!canUndo" :title="`${t.toolbar.undo} (Ctrl+Z)`" @click="emitAction('undo')">
      <Undo2 :size="16" />
    </button>
    <button class="tb-btn" :disabled="!canRedo" :title="`${t.toolbar.redo} (Ctrl+Shift+Z)`" @click="emitAction('redo')">
      <Redo2 :size="16" />
    </button>
    <div class="tb-divider" />
    <button class="tb-btn" :class="{ active: leftPanelVisible }" :title="leftPanelVisible ? t.panel.close : t.panel.openShapePanel" @click="emitAction('toggleLeftPanel')">
      <component :is="leftPanelVisible ? PanelLeftClose : PanelLeftOpen" :size="16" />
    </button>
    <div class="tb-divider" />
    <button class="tb-btn" :title="`${t.toolbar.selectAll} (Ctrl+A)`" @click="emitAction('selectAll')">
      <MousePointer2 :size="16" />
    </button>
    <button class="tb-btn" :class="{ active: panMode }" :title="`${t.toolbar.panTool} (H)`" @click="emitAction('togglePan')">
      <Hand :size="16" />
    </button>
    <div class="tb-divider" />
    <button class="tb-btn" :title="t.toolbar.zoomOut" @click="emitAction('zoomOut')">
      <ZoomOut :size="16" />
    </button>
    <span class="tb-zoom">{{ Math.round(zoom * 100) }}%</span>
    <button class="tb-btn" :title="t.toolbar.zoomIn" @click="emitAction('zoomIn')">
      <ZoomIn :size="16" />
    </button>
    <button class="tb-btn" :title="t.toolbar.fitCanvas" @click="emitAction('zoomToFit')">
      <Maximize2 :size="16" />
    </button>
    <div class="tb-divider" />
    <!-- 对齐按钮：仅当多个节点选中时显示 -->
    <template v-if="selectionCount >= 2">
      <button class="tb-btn" :title="t.toolbar.alignLeft" @click="emitAction('align:left')">
        <AlignStartVertical :size="16" />
      </button>
      <button class="tb-btn" :title="t.toolbar.alignCenterH" @click="emitAction('align:center')">
        <AlignCenterVertical :size="16" />
      </button>
      <button class="tb-btn" :title="t.toolbar.alignRight" @click="emitAction('align:right')">
        <AlignEndVertical :size="16" />
      </button>
      <button class="tb-btn" :title="t.toolbar.alignTop" @click="emitAction('align:top')">
        <AlignStartHorizontal :size="16" />
      </button>
      <button class="tb-btn" :title="t.toolbar.alignCenterV" @click="emitAction('align:middle')">
        <AlignCenterHorizontal :size="16" />
      </button>
      <button class="tb-btn" :title="t.toolbar.alignBottom" @click="emitAction('align:bottom')">
        <AlignEndHorizontal :size="16" />
      </button>
      <button class="tb-btn" :title="t.toolbar.distributeH" @click="emitAction('align:h-equal')">
        <AlignHorizontalSpaceBetween :size="16" />
      </button>
      <button class="tb-btn" :title="t.toolbar.distributeV" @click="emitAction('align:v-equal')">
        <AlignVerticalSpaceBetween :size="16" />
      </button>
      <button v-if="canGroup" class="tb-btn" :title="`${t.toolbar.group} (Ctrl+G)`" @click="emitAction('group')">
        <Group :size="16" />
      </button>
      <button v-if="canUngroup" class="tb-btn" :title="`${t.toolbar.ungroup} (Ctrl+Shift+G)`" @click="emitAction('ungroup')">
        <Ungroup :size="16" />
      </button>
      <div class="tb-divider" />
    </template>
    <button class="tb-btn" :class="{ active: drawMode }" :title="`${t.toolbar.freehand} (F)`" @click="emitAction('toggleDraw')">
      <Brush :size="16" />
    </button>
    <button class="tb-btn" :class="{ active: sketchMode }" :title="t.toolbar.sketch" @click="emitAction('toggleSketch')">
      <PenLine :size="16" />
    </button>
    <button class="tb-btn" :title="t.toolbar.clearCanvas" @click="emitAction('clearCanvas')">
      <Trash2 :size="16" />
    </button>
    <div class="tb-divider" />
    <button class="tb-btn" :title="t.toolbar.exportJson" @click="emitAction('export:json')">
      <FileJson :size="16" />
    </button>
    <button class="tb-btn" :title="t.toolbar.exportPng" @click="emitAction('export:png')">
      <ImageDown :size="16" />
    </button>
    <button class="tb-btn" :title="t.toolbar.exportSvg" @click="emitAction('export:svg')">
      <FileCode :size="16" />
    </button>
  </div>
</template>

<style scoped>
.toolbar-float {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 6px 10px;
  background: #fff;
  border-radius: 10px;
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.1),
    0 1px 4px rgba(0, 0, 0, 0.06);
  user-select: none;
  z-index: 20;
}

.tb-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  color: #555;
  transition: all 0.15s;
}

.tb-btn:hover:not(:disabled) {
  background: #f0f0f0;
  color: var(--uni-draw-primary);
}

.tb-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.tb-btn.active {
  background: var(--uni-draw-primary-bg);
  color: var(--uni-draw-primary);
}

.tb-divider {
  width: 1px;
  height: 20px;
  background: #eee;
  margin: 0 4px;
}

.tb-zoom {
  min-width: 42px;
  text-align: center;
  font-size: 12px;
  color: #555;
  font-family: monospace;
}
</style>
