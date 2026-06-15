<script setup lang="ts">
import '../../icon/iconfont.css'
import { computed, ref } from 'vue'
import type { MaterialItem, MaterialLibrary } from '@uni-draw/shared'
import { useLocale } from '../../locale'
import { getShapePreviewSVG } from './ShapePreviewRenderer'

export interface ShapeCategoryProps {
  library: MaterialLibrary
  collapsible?: boolean
}

const props = withDefaults(defineProps<ShapeCategoryProps>(), {
  collapsible: true,
})

const emit = defineEmits<{
  (e: 'dragstart', item: MaterialItem, event: DragEvent): void
  (e: 'select', item: MaterialItem): void
}>()

const t = useLocale()
const isExpanded = ref(true)
const displayLibraryName = computed(() => {
  const categories = t.panel.shapeCategories
  return categories[props.library.id as keyof typeof categories] ?? props.library.name
})

function toggle() {
  if (props.collapsible) {
    isExpanded.value = !isExpanded.value
  }
}

function onDragStart(item: MaterialItem, event: DragEvent) {
  event.dataTransfer?.setData('application/json', JSON.stringify(item))
  emit('dragstart', item, event)
}

function onSelect(item: MaterialItem) {
  emit('select', item)
}
</script>

<template>
  <div class="shape-category">
    <div class="shape-category-header" @click="toggle">
      <span class="shape-category-arrow" :class="{ expanded: isExpanded }">›</span>
      <span class="shape-category-name">{{ displayLibraryName }}</span>
      <span class="shape-category-count">{{ library.items.length }}</span>
    </div>
    <div v-show="isExpanded" class="shape-category-items">
      <div
        v-for="item in library.items"
        :key="item.id"
        class="shape-category-item"
        :title="item.name"
        draggable="true"
        @dragstart="(e: DragEvent) => onDragStart(item, e)"
        @click="onSelect(item)"
      >
        <div class="shape-preview-svg" v-html="getShapePreviewSVG(item.shape)" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.shape-category {
  user-select: none;
}

.shape-category-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  color: #555;
  transition: background 0.15s;
}

.shape-category-header:hover {
  background: #f0f0f0;
}

.shape-category-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  line-height: 1;
  transition: transform 0.2s;
  color: #999;
  flex-shrink: 0;
  transform: rotate(0deg);
}

.shape-category-arrow.expanded {
  transform: rotate(90deg);
}

.shape-category-name {
  flex: 1;
  margin-left: 4px;
}

.shape-category-count {
  font-size: 10px;
  color: #bbb;
}

.shape-category-items {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 2px;
  padding: 4px 8px 8px 8px;
}

.shape-category-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  margin: 0 auto;
  cursor: pointer;
  border-radius: 6px;
  color: #555;
  transition: all 0.15s;
}

.shape-category-item:hover {
  background: #eef1f8;
  color: var(--uni-draw-primary);
}

.shape-category-item:active {
  background: #dce5f5;
}

.shape-preview-svg {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
}

.shape-preview-svg svg {
  width: 100%;
  height: 100%;
  display: block;
}

.shape-preview-svg :deep(text) {
  font-family: sans-serif;
}
</style>
