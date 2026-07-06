<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useLocale } from '../../locale'

const props = defineProps<{
  visible: boolean
  x: number
  y: number
  hasSelection: boolean
  canPaste: boolean
  nodeSelectionCount: number
  edgeSelectionCount: number
  hasSingleNodeSelection: boolean
  allSelectedLocked: boolean
  canGroup: boolean
  canUngroup: boolean
}>()

const emit = defineEmits<{
  (e: 'action', action: string): void
  (e: 'close'): void
}>()

const t = useLocale()

const menuRef = ref<HTMLElement | null>(null)
const pos = ref({ left: 0, top: 0 })
const canCreateFrame = computed(() => props.nodeSelectionCount > 0)
const canAddToMaterials = computed(() => props.hasSingleNodeSelection)
const canFlip = computed(() => props.nodeSelectionCount > 0)
const canAddLink = computed(() => props.nodeSelectionCount >= 2)
const allSelectedLocked = computed(() => props.allSelectedLocked)

// 菜单显示后，测量真实尺寸并调整位置防止溢出
watch(
  () => props.visible,
  async (vis) => {
    if (!vis)
      return
    // 先放在鼠标位置
    pos.value = { left: props.x, top: props.y }
    // 等待 DOM 渲染
    await nextTick()
    const el = menuRef.value
    if (!el)
      return
    const rect = el.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    let left = props.x
    let top = props.y
    // 右侧溢出 → 向左偏移
    if (left + rect.width > vw)
      left = vw - rect.width - 8
    // 底部溢出 → 向上偏移
    if (top + rect.height > vh)
      top = vh - rect.height - 8
    if (left < 4)
      left = 4
    if (top < 4)
      top = 4
    pos.value = { left, top }
  },
)

function close() {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="context-menu-overlay"
      @click="close"
      @contextmenu.prevent="close"
    >
      <div
        ref="menuRef"
        class="context-menu"
        :style="{ left: `${pos.left}px`, top: `${pos.top}px` }"
        @click.stop
      >
        <div class="context-menu-group">
          <button
            class="context-menu-item"
            :class="{ disabled: !hasSelection }"
            :disabled="!hasSelection"
            @click="$emit('action', 'cut')"
          >
            <span class="menu-label">{{ t.contextMenu.cut }}</span>
            <span class="menu-shortcut">Ctrl+X</span>
          </button>
          <button
            class="context-menu-item"
            :class="{ disabled: !hasSelection }"
            :disabled="!hasSelection"
            @click="$emit('action', 'copy')"
          >
            <span class="menu-label">{{ t.contextMenu.copy }}</span>
            <span class="menu-shortcut">Ctrl+C</span>
          </button>
          <button
            class="context-menu-item"
            :class="{ disabled: !canPaste }"
            :disabled="!canPaste"
            @click="$emit('action', 'paste')"
          >
            <span class="menu-label">{{ t.contextMenu.paste }}</span>
            <span class="menu-shortcut">Ctrl+V</span>
          </button>
          <button
            class="context-menu-item"
            :class="{ disabled: !hasSelection }"
            :disabled="!hasSelection"
            @click="$emit('action', 'duplicate')"
          >
            <span class="menu-label">{{ t.contextMenu.duplicate }}</span>
            <span class="menu-shortcut">Ctrl+D</span>
          </button>
        </div>

        <div class="context-menu-divider" />

        <div class="context-menu-group">
          <button
            class="context-menu-item"
            :class="{ disabled: !canCreateFrame }"
            :disabled="!canCreateFrame"
            @click="$emit('action', 'createFrame')"
          >
            <span class="menu-label">{{ t.contextMenu.createFrame }}</span>
          </button>
        </div>

        <div class="context-menu-divider" />

        <div class="context-menu-group">
          <button
            class="context-menu-item"
            :class="{ disabled: !hasSelection }"
            :disabled="!hasSelection"
            @click="$emit('action', 'copyAsPng')"
          >
            <span class="menu-label">{{ t.contextMenu.copyAsPng }}</span>
            <span class="menu-shortcut">Shift+Alt+C</span>
          </button>
          <button
            class="context-menu-item"
            :class="{ disabled: !hasSelection }"
            :disabled="!hasSelection"
            @click="$emit('action', 'copyAsSvg')"
          >
            <span class="menu-label">{{ t.contextMenu.copyAsSvg }}</span>
          </button>
        </div>

        <div class="context-menu-divider" />

        <div class="context-menu-group">
          <button
            class="context-menu-item"
            :class="{ disabled: !canGroup }"
            :disabled="!canGroup"
            @click="$emit('action', 'group')"
          >
            <span class="menu-label">{{ t.contextMenu.group }}</span>
            <span class="menu-shortcut">Ctrl+G</span>
          </button>
          <button
            class="context-menu-item"
            :class="{ disabled: !canUngroup }"
            :disabled="!canUngroup"
            @click="$emit('action', 'ungroup')"
          >
            <span class="menu-label">{{ t.contextMenu.ungroup }}</span>
            <span class="menu-shortcut">Ctrl+Shift+G</span>
          </button>
        </div>

        <div class="context-menu-divider" />

        <!-- <div class="context-menu-group">
          <button
            class="context-menu-item"
            :class="{ disabled: !canAddToMaterials }"
            :disabled="!canAddToMaterials"
            @click="$emit('action', 'addToMaterials')"
          >
            <span class="menu-label">{{ t.contextMenu.addToMaterials }}</span>
          </button>
        </div> -->

        <div class="context-menu-divider" />

        <div class="context-menu-group">
          <button
            class="context-menu-item"
            :class="{ disabled: !hasSelection }"
            :disabled="!hasSelection"
            @click="$emit('action', 'moveDown')"
          >
            <span class="menu-label">{{ t.contextMenu.moveDown }}</span>
            <span class="menu-shortcut">Ctrl+[</span>
          </button>
          <button
            class="context-menu-item"
            :class="{ disabled: !hasSelection }"
            :disabled="!hasSelection"
            @click="$emit('action', 'moveUp')"
          >
            <span class="menu-label">{{ t.contextMenu.moveUp }}</span>
            <span class="menu-shortcut">Ctrl+]</span>
          </button>
          <button
            class="context-menu-item"
            :class="{ disabled: !hasSelection }"
            :disabled="!hasSelection"
            @click="$emit('action', 'toBottom')"
          >
            <span class="menu-label">{{ t.contextMenu.toBottom }}</span>
            <span class="menu-shortcut">Ctrl+Shift+[</span>
          </button>
          <button
            class="context-menu-item"
            :class="{ disabled: !hasSelection }"
            :disabled="!hasSelection"
            @click="$emit('action', 'toTop')"
          >
            <span class="menu-label">{{ t.contextMenu.toTop }}</span>
            <span class="menu-shortcut">Ctrl+Shift+]</span>
          </button>
        </div>

        <div class="context-menu-divider" />

        <div class="context-menu-group">
          <button
            class="context-menu-item"
            :class="{ disabled: !canFlip }"
            :disabled="!canFlip"
            @click="$emit('action', 'flipH')"
          >
            <span class="menu-label">{{ t.contextMenu.flipH }}</span>
            <span class="menu-shortcut">Shift+H</span>
          </button>
          <button
            class="context-menu-item"
            :class="{ disabled: !canFlip }"
            :disabled="!canFlip"
            @click="$emit('action', 'flipV')"
          >
            <span class="menu-label">{{ t.contextMenu.flipV }}</span>
            <span class="menu-shortcut">Shift+V</span>
          </button>
        </div>

        <div class="context-menu-divider" />

        <div class="context-menu-group">
          <button
            class="context-menu-item"
            :class="{ disabled: !canAddLink }"
            :disabled="!canAddLink"
            @click="$emit('action', 'addLink')"
          >
            <span class="menu-label">{{ t.contextMenu.addLink }}</span>
            <span class="menu-shortcut">Ctrl+K</span>
          </button>
        </div>

        <div class="context-menu-divider" />

        <div class="context-menu-group">
          <button
            class="context-menu-item"
            :class="{ disabled: !hasSelection }"
            :disabled="!hasSelection"
            @click="$emit('action', 'toggleLock')"
          >
            <span class="menu-label">{{ allSelectedLocked ? t.contextMenu.unlock : t.contextMenu.lock }}</span>
            <span class="menu-shortcut">Ctrl+Shift+L</span>
          </button>
        </div>

        <div class="context-menu-divider" />

        <div class="context-menu-group">
          <button
            class="context-menu-item context-menu-item-danger"
            :class="{ disabled: !hasSelection || allSelectedLocked }"
            :disabled="!hasSelection || allSelectedLocked"
            @click="$emit('action', 'delete')"
          >
            <span class="menu-label">{{ t.contextMenu.delete }}</span>
            <span class="menu-shortcut">Delete</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.context-menu-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: transparent;
}

.context-menu {
  position: fixed;
  min-width: 220px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow:
    0 6px 22px rgba(0, 0, 0, 0.12),
    0 1px 4px rgba(0, 0, 0, 0.08);
  padding: 4px 0;
  font-size: 13px;
  overflow: hidden;
}

.context-menu-group {
  padding: 2px 0;
}

.context-menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 7px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 13px;
  color: #333;
  text-align: left;
  transition: background 0.15s;
}

.context-menu-item:hover:not(.disabled) {
  background: #f0f5ff;
  color: #1a56db;
}

.context-menu-item.disabled {
  color: #ccc;
  cursor: default;
}

.context-menu-item.context-menu-item-danger {
  color: #e04343;
}

.context-menu-item.context-menu-item-danger:hover:not(.disabled) {
  background: #fff1f0;
  color: #cf1322;
}

.menu-shortcut {
  font-size: 11px;
  color: #999;
  margin-left: 24px;
  font-family: monospace;
}

.menu-label {
  white-space: nowrap;
}

.context-menu-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 4px 8px;
}
</style>
