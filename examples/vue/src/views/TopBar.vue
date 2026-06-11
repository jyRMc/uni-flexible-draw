<template>
  <div class="top-bar">
    <div class="top-bar-left">
      <div class="top-logo">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="6" fill="var(--primary)"/>
          <path d="M7 8h10M7 12h10M7 16h6" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span class="top-brand">UniDraw</span>
      </div>
      <button class="top-btn text-only" @click="$emit('exit')">{{ texts.exit }}</button>
      <span class="top-divider">|</span>
      <span class="top-title">{{ title }}</span>
      <span class="top-autosave">{{ texts.autosave }} {{ autosaveTime }}</span>
    </div>

    <div class="top-bar-center">
      <div class="top-avatars">
        <div class="top-avatar" v-for="i in 3" :key="i" :style="{ background: avatarColors[i - 1] }">
          {{ avatarLetters[i - 1] }}
        </div>
        <div class="top-avatar-more">+12</div>
      </div>
    </div>

    <div class="top-bar-right">
      <button class="top-btn" :title="texts.languageSwitch" @click="$emit('toggleLanguage')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 8h14"/><path d="M5 16h14"/><path d="M9 4c0 7.2 2.4 12.2 3 13.5C12.6 16.2 15 11.2 15 4"/><path d="M9 20h6"/></svg>
        {{ lang === 'zh-CN' ? 'EN' : 'ZH' }}
      </button>
      <button class="top-btn" @click="$emit('share')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
        {{ texts.share }}
      </button>
      <button class="top-btn" @click="$emit('templates')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>
        {{ texts.templates }}
      </button>
      <button class="top-btn" :class="{ active: editing }" @click="$emit('toggleEdit')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        {{ texts.edit }}
      </button>
      <button class="top-btn" @click="$emit('preview')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        {{ texts.preview }}
      </button>
      <button class="top-btn icon-only" :title="texts.search">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      </button>
      <button class="top-btn icon-only" :title="texts.help">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      </button>
      <span class="top-zoom-badge">{{ zoomPercent }}%</span>
      <button class="top-btn primary" @click="$emit('aiDraw')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        {{ texts.aiDraw }}
      </button>
      <button class="top-btn primary-outline" @click="$emit('newChat')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        {{ texts.newChat }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UniDrawLocale } from '@uni-draw/draw'

export interface TopBarProps {
  title?: string
  autosaveTime?: string
  zoomPercent?: number
  editing?: boolean
  lang?: 'zh-CN' | 'en-US'
  texts: UniDrawLocale['example']['topBar']
}

withDefaults(defineProps<TopBarProps>(), {
  title: 'Untitled Diagram',
  autosaveTime: '10:24',
  zoomPercent: 100,
  editing: false,
  lang: 'zh-CN',
})

defineEmits<{
  (e: 'share'): void
  (e: 'templates'): void
  (e: 'toggleEdit'): void
  (e: 'preview'): void
  (e: 'toggleLanguage'): void
  (e: 'aiDraw'): void
  (e: 'newChat'): void
  (e: 'exit'): void
}>()

const avatarColors = ['var(--primary)', '#52c41a', '#fa8c16']
const avatarLetters = ['A', 'B', 'C']
</script>

<style scoped>
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 0 16px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  flex-shrink: 0;
  user-select: none;
  gap: 16px;
}

.top-bar-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.top-logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.top-brand {
  font-size: 15px;
  font-weight: 700;
  color: var(--primary);
  letter-spacing: 0.5px;
}

.top-divider {
  color: #d9d9d9;
  font-size: 18px;
  margin: 0 2px;
}

.top-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.top-autosave {
  font-size: 11px;
  color: #bbb;
  white-space: nowrap;
}

.top-bar-center {
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: center;
}

.top-avatars {
  display: flex;
  align-items: center;
  gap: -6px;
}

.top-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  border: 2px solid #fff;
  margin-left: -8px;
}

.top-avatar:first-child {
  margin-left: 0;
}

.top-avatar-more {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #999;
  border: 2px solid #fff;
  margin-left: -8px;
}

.top-bar-right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.top-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 32px;
  padding: 0 10px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
  color: #555;
  transition: all 0.2s;
  white-space: nowrap;
}

.top-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.top-btn.icon-only {
  padding: 0;
  width: 32px;
  justify-content: center;
}

.top-btn.text-only {
  border: none;
  padding: 0 6px;
  color: #999;
  font-size: 13px;
  height: auto;
  min-width: auto;
}

.top-btn.text-only:hover {
  color: var(--primary);
}

.top-btn.active {
  background: var(--primary-bg);
  border-color: var(--primary);
  color: var(--primary);
}

.top-btn.primary {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
  font-weight: 500;
}

.top-btn.primary:hover {
  background: color-mix(in srgb, var(--primary) 85%, #000);
  border-color: color-mix(in srgb, var(--primary) 85%, #000);
  color: #fff;
}

.top-btn.primary-outline {
  border-color: var(--primary);
  color: var(--primary);
}

.top-btn.primary-outline:hover {
  background: var(--primary-bg);
}

.top-zoom-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 0 8px;
  background: #f5f5f5;
  border-radius: 6px;
  font-size: 12px;
  color: #888;
  font-weight: 500;
  min-width: 42px;
}

</style>
