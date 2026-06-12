<script setup lang="ts">
import { type Component, computed, createApp, h, nextTick, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'

// ── Types ─────────────────────────────────────────────────────────────
interface IconEntry {
  name: string
  label: string
  component: Component
}

interface PixabayItem {
  id: number
  previewURL: string
  webformatURL: string
  largeImageURL: string
  tags: string
}

const emit = defineEmits<{
  (e: 'pick', item: { key: string, label: string }): void
}>()
// ── Type tabs ─────────────────────────────────────────────────────
const TYPE_TABS = [
  { key: 'icon', label: '图标' },
  { key: 'material', label: '材料' },
] as const
type AssetType = typeof TYPE_TABS[number]['key']

const assetType = ref<AssetType>('icon')

const query = ref('')

// ── Icon lazy loading ─────────────────────────────────────────────────
const iconsLoaded = ref(false)
const iconEntries = shallowRef<IconEntry[]>([])
const svgCache = new Map<string, string>()

async function loadIcons() {
  if (iconsLoaded.value)
    return
  const mod = await import('@vicons/ionicons5') as Record<string, Component>
  iconEntries.value = Object.keys(mod)
    .filter(k => k !== 'default')
    .sort()
    .map(name => ({
      name,
      label: name.replace(/(?:Outline|Sharp|Filled)$/, '').replace(/([A-Z])/g, ' $1').trim(),
      component: mod[name],
    }))
  iconsLoaded.value = true
}

watch(() => assetType.value === 'icon', (active) => {
  if (active)
    loadIcons()
}, { immediate: true })

// ── Virtual scroll ────────────────────────────────────────────────────
const ICON_COLS = 5
const ICON_ROW_H = 44
const BUFFER = 3

const iconScrollRef = ref<HTMLElement | null>(null)
const iconScrollTop = ref(0)
const iconViewportH = ref(300)

function onIconScroll() {
  iconScrollTop.value = iconScrollRef.value?.scrollTop ?? 0
}

onMounted(() => {
  if (!iconScrollRef.value)
    return
  iconViewportH.value = iconScrollRef.value.clientHeight || 300
  const ro = new ResizeObserver(([e]) => { iconViewportH.value = e.contentRect.height })
  ro.observe(iconScrollRef.value)
  onUnmounted(() => ro.disconnect())
})

const filteredIconEntries = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q)
    return iconEntries.value
  return iconEntries.value.filter(e => e.name.toLowerCase().includes(q))
})

const totalIconRows = computed(() => Math.ceil(filteredIconEntries.value.length / ICON_COLS))
const totalIconHeight = computed(() => totalIconRows.value * ICON_ROW_H)
const visStartRow = computed(() => Math.max(0, Math.floor(iconScrollTop.value / ICON_ROW_H) - BUFFER))
const visEndRow = computed(() => Math.min(
  totalIconRows.value,
  Math.ceil((iconScrollTop.value + iconViewportH.value) / ICON_ROW_H) + BUFFER,
))
const visibleIconEntries = computed(() => {
  const s = visStartRow.value * ICON_COLS
  const e = Math.min(filteredIconEntries.value.length, visEndRow.value * ICON_COLS)
  return filteredIconEntries.value.slice(s, e)
})
const iconOffsetY = computed(() => visStartRow.value * ICON_ROW_H)

// ── SVG extraction ────────────────────────────────────────────────────
function extractIconSvg(name: string, component: Component): string {
  if (svgCache.has(name))
    return svgCache.get(name)!
  try {
    const div = document.createElement('div')
    const app = createApp({ render: () => h(component as any, { size: 32 }) })
    app.mount(div)
    const svg = div.querySelector('svg')?.outerHTML ?? ''
    app.unmount()
    div.remove()
    svgCache.set(name, svg)
    return svg
  }
  catch { return '' }
}

function emitIconPick(entry: IconEntry) {
  emit('pick', { key: entry.name, label: entry.label })
}

// ── Material (Pixabay) ──────────────────────────────────────────────
const PIXABAY_KEY: string = (import.meta as any).env?.VITE_PIXABAY_KEY ?? ''
const pixabayKeySet = computed(() => !!PIXABAY_KEY)
const materialItems = ref<PixabayItem[]>([])
const materialLoading = ref(false)
const materialPage = ref(1)
const materialTotal = ref(0)
const materialScrollRef = ref<HTMLElement | null>(null)

async function searchMaterials(append = false) {
  const q = query.value.trim()
  if (!q) { materialItems.value = []; materialTotal.value = 0; return }
  if (!PIXABAY_KEY) {
    console.warn('[AssetsPanel] Set VITE_PIXABAY_KEY in .env to enable material search')
    return
  }
  if (!append) { materialPage.value = 1; materialItems.value = [] }
  materialLoading.value = true
  try {
    const url = `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${encodeURIComponent(q)}&per_page=20&page=${materialPage.value}&image_type=all&safesearch=true`
    const res = await fetch(url)
    const json = await res.json()
    materialTotal.value = json.totalHits ?? 0
    const hits: PixabayItem[] = (json.hits ?? []).map((h: any) => ({
      id: h.id,
      previewURL: h.previewURL,
      webformatURL: h.webformatURL,
      largeImageURL: h.largeImageURL,
      tags: h.tags,
    }))
    materialItems.value = append ? [...materialItems.value, ...hits] : hits
  }
  catch (e) {
    console.error('[AssetsPanel] Pixabay fetch failed', e)
  }
  finally {
    materialLoading.value = false
  }
}

function loadMoreMaterials() { materialPage.value++; searchMaterials(true) }

// ── Image lazy loading ────────────────────────────────────────────────
let imageObserver: IntersectionObserver | null = null

function setupImageObserver() {
  if (imageObserver)
    return
  imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement
        const src = img.dataset.src
        if (src) {
          img.src = src
          img.removeAttribute('data-src')
        }
        imageObserver!.unobserve(img)
      }
    })
  }, { root: materialScrollRef.value })
}

function observeMaterialImages() {
  if (!imageObserver || !materialScrollRef.value)
    return
  const imgs = materialScrollRef.value.querySelectorAll<HTMLImageElement>('img[data-src]')
  imgs.forEach(img => imageObserver!.observe(img))
}

watch(materialItems, () => {
  nextTick(() => observeMaterialImages())
}, { deep: true })

onMounted(() => {
  setupImageObserver()
  observeMaterialImages()
})

onUnmounted(() => {
  imageObserver?.disconnect()
  imageObserver = null
})

function onMaterialDragStart(event: DragEvent, item: PixabayItem) {
  if (event.dataTransfer)
    event.dataTransfer.effectAllowed = 'copy'
  event.dataTransfer?.setData('application/json', JSON.stringify({
    id: `material-${item.id}`,
    name: item.tags.split(',')[0].trim(),
    shape: 'basic-image',
    defaultSize: { width: 160, height: 120 },
    defaultLabel: '',
    defaultStyle: {},
    data: { imageHref: item.webformatURL },
  }))
}

// ── Computed ─────────────────────────────────────────────────────
const searchPlaceholder = computed(() =>
  assetType.value === 'icon' ? '搜索图标...' : '搜索素材 (English)...',
)

// ── Drag handlers ─────────────────────────────────────────────────────
function onIconDragStart(event: DragEvent, entry: IconEntry) {
  if (event.dataTransfer)
    event.dataTransfer.effectAllowed = 'copy'
  const svg = extractIconSvg(entry.name, entry.component)
  const encoded = svg ? encodeURIComponent(svg) : ''
  event.dataTransfer?.setData('application/json', JSON.stringify(
    encoded
      ? { id: `icon-${entry.name}`, name: entry.label, shape: 'basic-image', defaultSize: { width: 40, height: 40 }, defaultLabel: '', data: { imageHref: `data:image/svg+xml;charset=utf-8,${encoded}` } }
      : { id: `icon-${entry.name}`, name: entry.label, shape: 'basic-rounded-rect', defaultSize: { width: 80, height: 40 }, defaultLabel: entry.label, defaultStyle: { fill: '#f0f4ff', stroke: '#7166F0', strokeWidth: 1.5 } },
  ))
}
</script>

<template>
  <div class="assets-panel">
    <!-- Type switcher -->
    <div class="type-tabs">
      <button
        v-for="t in TYPE_TABS" :key="t.key"
        class="type-tab" :class="[{ active: assetType === t.key }]"
        @click="assetType = t.key; query = '';"
      >
        {{ t.label }}
      </button>
    </div>

    <!-- Search -->
    <div class="assets-search">
      <svg class="search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
      <input
        v-model="query" :placeholder="searchPlaceholder" class="search-input"
        @keydown.enter="assetType === 'material' && searchMaterials()"
      >
      <button
        v-if="query" class="search-clear"
        @click="query = ''; assetType === 'material' && searchMaterials()"
      >
        ×
      </button>
    </div>

    <!-- Count hint -->
    <div class="assets-meta">
      <span v-if="assetType === 'icon'">{{ iconsLoaded ? filteredIconEntries.length : '...' }} 个图标</span>
      <span v-else>
        <template v-if="materialLoading">搜索中...</template>
        <template v-else-if="materialTotal > 0">约 {{ materialTotal }} 张</template>
        <template v-else>输入关键词按 Enter 搜索</template>
      </span>
    </div>

    <!-- ── 图标 grid (virtual scroll + lazy load) ── -->
    <div v-if="assetType === 'icon'" ref="iconScrollRef" class="assets-scroll" @scroll="onIconScroll">
      <div v-if="!iconsLoaded" class="assets-loading">
        加载图标库...
      </div>
      <template v-else>
        <div v-if="filteredIconEntries.length === 0" class="assets-empty">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <p>未找到匹配图标</p>
        </div>
        <div v-else class="icon-vscroll-space" :style="{ height: `${totalIconHeight}px` }">
          <div class="assets-grid icon-vscroll-grid" :style="{ transform: `translateY(${iconOffsetY}px)` }">
            <div
              v-for="entry in visibleIconEntries" :key="entry.name"
              class="asset-cell" :title="entry.label"
              draggable="true"
              @dragstart="onIconDragStart($event, entry)"
              @click="emitIconPick(entry)"
            >
              <component :is="entry.component" :size="22" class="asset-icon" />
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- ── 材料 grid (Pixabay) ── -->
    <div v-else ref="materialScrollRef" class="assets-scroll">
      <div v-if="!materialItems.length && !materialLoading" class="assets-empty">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ddd" stroke-width="1.2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21,15 16,10 5,21" /></svg>
        <p>输入关键词后按 Enter 搜索</p>
        <span v-if="!pixabayKeySet" class="material-no-key">⚠️ 未配置 VITE_PIXABAY_KEY</span>
      </div>
      <template v-else>
        <div class="material-grid">
          <div
            v-for="item in materialItems" :key="item.id"
            class="material-cell" :title="item.tags"
            draggable="true"
            @dragstart="onMaterialDragStart($event, item)"
          >
            <img :data-src="item.previewURL" :alt="item.tags" class="material-thumb">
          </div>
        </div>
        <div v-if="materialLoading" class="assets-loading">
          加载中...
        </div>
        <div v-else-if="materialItems.length < materialTotal" class="material-load-more">
          <button @click="loadMoreMaterials">
            加载更多
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.assets-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: #fafbfc;
}

/* ── Search ── */
.assets-search {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 8px;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.search-icon {
  color: #aaa;
  flex-shrink: 0;

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 12px;
  background: transparent;
  color: #333;
}

.search-clear {
  border: none;
  background: none;
  color: #bbb;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  padding: 0 2px;
}

/* ── Meta ── */
.assets-meta {
  padding: 3px 8px;
  font-size: 10px;
  color: #bbb;
  flex-shrink: 0;
}

/* ── Grid ── */
.assets-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 4px 4px 8px;
}

.assets-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 2px;
}

.asset-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border-radius: 6px;
  cursor: grab;
  transition: background 0.12s;
  user-select: none;
}
.asset-cell:hover {
  background: #eef2ff;

.asset-cell:active {
  cursor: grabbing;
  background: #dce5ff;

.asset-icon {
  color: #555;
  flex-shrink: 0;

.asset-cell:hover .asset-icon {
  color: var(--primary);

/* ── Virtual scroll (icon grid) ── */
.icon-vscroll-space {
  position: relative;
}
.icon-vscroll-grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}

/* ── Loading ── */
.assets-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px;
  font-size: 12px;
  color: #bbb;
}

/* ── Empty ── */
.assets-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 16px;
  color: #ccc;
  font-size: 12px;
}

/* ── Type switcher ── */
.type-tabs {
  display: flex;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}
.type-tab {
  flex: 1;
  padding: 7px 0;
  border: none;
  background: none;
  font-size: 12px;
  color: #888;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.15s;
}
.type-tab:hover {
  color: var(--primary);

.type-tab.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
  font-weight: 600;

/* ── Material grid (Pixabay) ── */
.material-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
  padding: 4px;
}

.material-cell {
  position: relative;
  border-radius: 6px;
  overflow: hidden;
  cursor: grab;
  border: 1px solid #e8e8e8;
  background: #f5f5f5;
  transition: box-shadow 0.12s;
}
.material-cell:hover {
  box-shadow: 0 0 0 2px var(--primary);

.material-cell:active {
  cursor: grabbing;

.material-thumb {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  display: block;
}

.material-load-more {
  display: flex;
  justify-content: center;
  padding: 8px 0 12px;
}
.material-load-more button {
  padding: 5px 18px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background: #fff;
  font-size: 11px;
  color: #555;
  cursor: pointer;
}
.material-load-more button:hover {
  border-color: var(--primary);
  color: var(--primary);

.material-no-key {
  font-size: 10px;
  color: #e6a817;
  margin-top: 4px;
}
</style>
