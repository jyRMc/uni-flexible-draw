<template>
  <div class="ai-panel">
    <!-- 标签页切换 -->
    <div class="ai-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="ai-tab"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- 推荐提示 标签页 -->
    <div v-if="activeTab === 'suggestions'" class="ai-tab-content">
      <div class="ai-prompts">
        <div class="ai-prompts-title">试试这样说</div>
        <div class="ai-prompts-list">
          <button
            v-for="prompt in suggestions"
            :key="prompt"
            class="ai-prompt-btn"
            @click="sendPrompt(prompt)"
          >
            {{ prompt }}
          </button>
        </div>
      </div>
    </div>

    <!-- 助手 标签页 -->
    <div v-if="activeTab === 'chat'" class="ai-tab-content chat-content">
      <div class="ai-messages">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          class="ai-message"
          :class="msg.role"
        >
          <div class="ai-message-content">{{ msg.content }}</div>
        </div>
        <div v-if="isLoading" class="ai-message assistant">
          <div class="ai-message-content ai-typing">
            <span class="dot" /><span class="dot" /><span class="dot" />
          </div>
        </div>
      </div>

      <!-- 你可能还想问 -->
      <div v-if="followUpQuestions.length > 0 && !isLoading" class="ai-follow-ups">
        <div class="ai-follow-ups-title">你可能还想问</div>
        <button
          v-for="q in followUpQuestions"
          :key="q"
          class="ai-follow-up-btn"
          @click="sendPrompt(q)"
        >
          {{ q }}
        </button>
      </div>
    </div>

    <!-- 历史记录 标签页 -->
    <div v-if="activeTab === 'history'" class="ai-tab-content">
      <div class="ai-history-empty">
        <div class="ai-history-empty-icon">📋</div>
        <div class="ai-history-empty-text">暂无历史记录</div>
      </div>
    </div>

    <!-- 底部输入区 -->
    <div class="ai-input-area">
      <div class="ai-input-row">
        <input
          v-model="inputValue"
          type="text"
          placeholder="描述你想绘制的图表..."
          class="ai-input"
          @keyup.enter="sendInput"
        >
        <button class="ai-send-btn" :disabled="isLoading || !inputValue.trim()" @click="sendInput">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
      <div class="ai-model-selector">
        <span class="ai-model-label">DeepSeek-V3 · SiliconFlow</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export interface AIPanelProps {
  messages?: Message[]
  suggestions?: string[]
  isLoading?: boolean
  followUpQuestions?: string[]
}

const props = withDefaults(defineProps<AIPanelProps>(), {
  messages: () => [],
  suggestions: () => [
    '绘制一个 Spring Boot 微服务架构图',
    '绘制一个用户登录流程图',
    '绘制一个简单的类图',
  ],
  isLoading: false,
  followUpQuestions: () => [],
})

const emit = defineEmits<{
  (e: 'send', prompt: string): void
}>()

const inputValue = ref('')
const activeTab = ref<'suggestions' | 'chat' | 'history'>('chat')

const tabs = [
  { key: 'suggestions' as const, label: '推荐提示' },
  { key: 'chat' as const, label: '助手' },
  { key: 'history' as const, label: '历史记录' },
]

function sendPrompt(prompt: string) {
  activeTab.value = 'chat'
  emit('send', prompt)
}

function sendInput() {
  if (!inputValue.value.trim() || props.isLoading) return
  activeTab.value = 'chat'
  emit('send', inputValue.value.trim())
  inputValue.value = ''
}
</script>

<style scoped>
.ai-panel {
  display: flex;
  flex-direction: column;
  width: 340px;
  height: 100%;
  background: #ffffff;
  border-left: 1px solid #e8e8e8;
  flex-shrink: 0;
}

/* 标签页 */
.ai-tabs {
  display: flex;
  border-bottom: 1px solid #e8e8e8;
  flex-shrink: 0;
}

.ai-tab {
  flex: 1;
  height: 40px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 13px;
  color: #999;
  position: relative;
  transition: color 0.2s;
}

.ai-tab:hover {
  color: var(--primary);
}

.ai-tab.active {
  color: var(--primary);
  font-weight: 600;
}

.ai-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 2px;
  background: var(--primary);
  border-radius: 1px;
}

/* 标签页内容 */
.ai-tab-content {
  flex: 1;
  overflow-y: auto;
}

.chat-content {
  display: flex;
  flex-direction: column;
}

/* 推荐提示 */
.ai-prompts {
  padding: 16px;
}

.ai-prompts-title {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.ai-prompts-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ai-prompt-btn {
  padding: 10px 12px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background: #fafafa;
  cursor: pointer;
  font-size: 13px;
  color: #555;
  text-align: left;
  transition: all 0.2s;
  line-height: 1.4;
}

.ai-prompt-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-bg-light);
}

/* 消息区 */
.ai-messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
}

.ai-message {
  margin-bottom: 12px;
}

.ai-message-content {
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.6;
  word-break: break-word;
}

.ai-message.user .ai-message-content {
  background: var(--primary-bg);
  color: #1890ff;
  margin-left: 24px;
  border-top-right-radius: 4px;
}

.ai-message.assistant .ai-message-content {
  background: #f5f5f5;
  color: #333;
  margin-right: 24px;
  border-top-left-radius: 4px;
}

/* 加载动画 */
.ai-typing {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 0;
}

.ai-typing .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ccc;
  animation: typingDot 1.4s infinite;
}

.ai-typing .dot:nth-child(2) {
  animation-delay: 0.2s;
}

.ai-typing .dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typingDot {
  0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
  30% { opacity: 1; transform: scale(1); }
}

/* 你可能还想问 */
.ai-follow-ups {
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
}

.ai-follow-ups-title {
  font-size: 12px;
  color: #bbb;
  margin-bottom: 8px;
}

.ai-follow-up-btn {
  display: block;
  width: 100%;
  padding: 8px 12px;
  margin-bottom: 6px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  font-size: 12px;
  color: #555;
  text-align: left;
  transition: all 0.2s;
}

.ai-follow-up-btn:last-child {
  margin-bottom: 0;
}

.ai-follow-up-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-bg-light);
}

/* 历史记录空状态 */
.ai-history-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #ccc;
}

.ai-history-empty-icon {
  font-size: 36px;
  margin-bottom: 12px;
}

.ai-history-empty-text {
  font-size: 13px;
  color: #bbb;
}

/* 底部输入区 */
.ai-input-area {
  padding: 12px 16px;
  border-top: 1px solid #e8e8e8;
  flex-shrink: 0;
}

.ai-input-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.ai-input {
  flex: 1;
  padding: 9px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
  background: #fafafa;
}

.ai-input:focus {
  border-color: var(--primary);
  background: #fff;
}

.ai-send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: var(--primary);
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
}

.ai-send-btn:hover:not(:disabled) {
  background: #4a7de4;
}

.ai-send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ai-model-selector {
  display: flex;
  align-items: center;
  margin-top: 8px;
}

.ai-model-label {
  font-size: 11px;
  color: #bbb;
  padding: 2px 8px;
  background: #f5f5f5;
  border-radius: 4px;
}
</style>
