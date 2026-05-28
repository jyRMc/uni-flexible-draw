<template>
  <div class="shape-panel">
    <div v-if="searchable" class="shape-panel-search">
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="t.panel.searchShapes"
        class="shape-panel-search-input"
      >
    </div>
    <div class="shape-panel-content">
      <ShapeCategory
        v-for="library in filteredLibraries"
        :key="library.id"
        :library="library"
        :collapsible="collapsible"
        @dragstart="onDragStart"
        @select="onSelect"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { MaterialLibrary, MaterialItem } from '@uni-draw/shared'
import { useLocale } from '../../locale'
import ShapeCategory from './ShapeCategory.vue'

export interface ShapePanelProps {
  libraries: MaterialLibrary[]
  searchable?: boolean
  collapsible?: boolean
}

const props = withDefaults(defineProps<ShapePanelProps>(), {
  searchable: true,
  collapsible: true,
})

const emit = defineEmits<{
  (e: 'dragstart', item: MaterialItem, event: DragEvent): void
  (e: 'select', item: MaterialItem): void
}>()

const t = useLocale()
const searchQuery = ref('')

const filteredLibraries = computed(() => {
  if (!searchQuery.value.trim()) return props.libraries
  const query = searchQuery.value.toLowerCase()
  return props.libraries
    .map((lib: MaterialLibrary) => ({
      ...lib,
      items: lib.items.filter(
        (item: MaterialItem) =>
          item.name.toLowerCase().includes(query) ||
          item.shape.toLowerCase().includes(query),
      ),
    }))
    .filter((lib: MaterialLibrary) => lib.items.length > 0)
})

function onDragStart(item: MaterialItem, event: DragEvent) {
  emit('dragstart', item, event)
}

function onSelect(item: MaterialItem) {
  emit('select', item)
}
</script>

<style scoped>
.shape-panel {
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 1;
  min-height: 0;
  background: #fafbfc;
  border-right: 1px solid #e8e8e8;
  flex-shrink: 0;
}

/* ── Search ── */
.shape-panel-search {
  padding: 8px;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.shape-panel-search-input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 12px;
  outline: none;
  box-sizing: border-box;
  background: #fff;
  transition: border-color 0.2s;
}

.shape-panel-search-input:focus {
  border-color: var(--uni-draw-primary);
}

/* ── Shape list ── */
.shape-panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 2px 0 12px;
}

</style>
