import { useState } from 'react'
import type { CSSProperties } from 'react'
import type { AIConnectionConfig } from '../../../vue/src/mocks/aiService'

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface AIPanelProps {
  messages?: Message[]
  suggestions?: string[]
  isLoading?: boolean
  followUpQuestions?: string[]
  config?: AIConnectionConfig
  onConfigChange?: (config: AIConnectionConfig) => void
  onSend?: (prompt: string) => void
  style?: CSSProperties
}

const styles: Record<string, CSSProperties> = {
  panel: {
    display: 'flex',
    flexDirection: 'column',
    width: 340,
    height: '100%',
    background: '#ffffff',
    borderLeft: '1px solid #e8e8e8',
    flexShrink: 0,
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #e8e8e8',
    flexShrink: 0,
  },
  tab: {
    flex: 1,
    height: 40,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: 13,
    color: '#999',
    position: 'relative',
  },
  tabActive: {
    color: 'var(--primary)',
    fontWeight: 600,
  },
  content: {
    flex: 1,
    overflowY: 'auto',
  },
  chatContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  prompts: {
    padding: 16,
  },
  promptsTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: '#333',
    marginBottom: 12,
  },
  promptsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  promptBtn: {
    padding: '10px 12px',
    border: '1px solid #e8e8e8',
    borderRadius: 8,
    background: '#fafafa',
    cursor: 'pointer',
    fontSize: 13,
    color: '#555',
    textAlign: 'left',
    lineHeight: 1.4,
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px 16px',
  },
  message: {
    marginBottom: 12,
  },
  messageContent: {
    padding: '10px 14px',
    borderRadius: 10,
    fontSize: 13,
    lineHeight: 1.6,
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
  },
  userMessage: {
    background: 'var(--primary-bg)',
    color: '#1890ff',
    marginLeft: 24,
    borderTopRightRadius: 4,
  },
  assistantMessage: {
    background: '#f5f5f5',
    color: '#333',
    marginRight: 24,
    borderTopLeftRadius: 4,
  },
  typing: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '6px 0',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#ccc',
  },
  followUps: {
    padding: '12px 16px',
    borderTop: '1px solid #f0f0f0',
  },
  followUpsTitle: {
    fontSize: 12,
    color: '#bbb',
    marginBottom: 8,
  },
  followUpBtn: {
    display: 'block',
    width: '100%',
    padding: '8px 12px',
    marginBottom: 6,
    border: '1px solid #e8e8e8',
    borderRadius: 6,
    background: '#fff',
    cursor: 'pointer',
    fontSize: 12,
    color: '#555',
    textAlign: 'left',
  },
  historyEmpty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#ccc',
  },
  inputArea: {
    padding: '12px 16px',
    borderTop: '1px solid #e8e8e8',
    flexShrink: 0,
  },
  inputRow: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: '9px 12px',
    border: '1px solid #e0e0e0',
    borderRadius: 8,
    fontSize: 13,
    outline: 'none',
    background: '#fafafa',
  },
  sendBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    padding: 0,
    border: 'none',
    borderRadius: 8,
    background: 'var(--primary)',
    color: '#fff',
    cursor: 'pointer',
    flexShrink: 0,
  },
  sendBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  modelSelector: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    marginTop: 8,
    gap: 8,
  },
  modelLabel: {
    fontSize: 11,
    color: '#bbb',
    padding: '2px 8px',
    background: '#f5f5f5',
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  configGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  configInput: {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid #e0e0e0',
    borderRadius: 8,
    fontSize: 12,
    outline: 'none',
    background: '#fafafa',
    boxSizing: 'border-box',
  },
}

const tabs = [
  { key: 'suggestions' as const, label: '推荐提示' },
  { key: 'chat' as const, label: '助手' },
  { key: 'history' as const, label: '历史记录' },
]

export default function AIPanel({
  messages = [],
  suggestions = [
    '绘制一个 Spring Boot 微服务架构图',
    '绘制一个用户登录流程图',
    '绘制一个简单的类图',
  ],
  isLoading = false,
  followUpQuestions = [],
  config = { model: '', apiUrl: '', apiKey: '' },
  onConfigChange,
  onSend,
  style,
}: AIPanelProps) {
  const [inputValue, setInputValue] = useState('')
  const [activeTab, setActiveTab] = useState<'suggestions' | 'chat' | 'history'>('chat')

  const sendPrompt = (prompt: string) => {
    setActiveTab('chat')
    onSend?.(prompt)
  }

  const sendInput = () => {
    if (!inputValue.trim() || isLoading) return
    const nextPrompt = inputValue.trim()
    setInputValue('')
    setActiveTab('chat')
    onSend?.(nextPrompt)
  }

  const updateConfig = (patch: Partial<AIConnectionConfig>) => {
    onConfigChange?.({
      ...config,
      ...patch,
    })
  }

  return (
    <div style={{ ...styles.panel, ...style }}>
      <div style={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            style={activeTab === tab.key ? { ...styles.tab, ...styles.tabActive } : styles.tab}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'suggestions' && (
        <div style={styles.content}>
          <div style={styles.prompts}>
            <div style={styles.promptsTitle}>试试这样说</div>
            <div style={styles.promptsList}>
              {suggestions.map((prompt) => (
                <button key={prompt} type="button" style={styles.promptBtn} onClick={() => sendPrompt(prompt)}>
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'chat' && (
        <div style={{ ...styles.content, ...styles.chatContent }}>
          <div style={styles.messages}>
            {messages.map((msg, index) => (
              <div key={`${msg.role}-${index}`} style={styles.message}>
                <div style={msg.role === 'user' ? { ...styles.messageContent, ...styles.userMessage } : { ...styles.messageContent, ...styles.assistantMessage }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={styles.message}>
                <div style={{ ...styles.messageContent, ...styles.assistantMessage }}>
                  <div style={styles.typing}>
                    <span style={styles.dot} />
                    <span style={styles.dot} />
                    <span style={styles.dot} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {followUpQuestions.length > 0 && !isLoading && (
            <div style={styles.followUps}>
              <div style={styles.followUpsTitle}>你可能还想问</div>
              {followUpQuestions.map((question) => (
                <button key={question} type="button" style={styles.followUpBtn} onClick={() => sendPrompt(question)}>
                  {question}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div style={styles.content}>
          <div style={styles.historyEmpty}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 13, color: '#bbb' }}>暂无历史记录</div>
          </div>
        </div>
      )}

      <div style={styles.inputArea}>
        <div style={styles.inputRow}>
          <input
            value={inputValue}
            type="text"
            placeholder="描述你想绘制的图表..."
            style={styles.input}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyUp={(event) => {
              if (event.key === 'Enter') sendInput()
            }}
          />
          <button
            type="button"
            style={isLoading || !inputValue.trim() ? { ...styles.sendBtn, ...styles.sendBtnDisabled } : styles.sendBtn}
            disabled={isLoading || !inputValue.trim()}
            onClick={sendInput}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <div style={styles.modelSelector}>
          <div style={styles.configGrid}>
            <input
              value={config.model}
              type="text"
              placeholder="模型名称，例如 deepseek-ai/DeepSeek-V3"
              style={styles.configInput}
              onChange={(event) => updateConfig({ model: event.target.value })}
            />
            <input
              value={config.apiUrl}
              type="text"
              placeholder="RestAPI 调用地址，例如 https://api.example.com/v1/chat/completions"
              style={styles.configInput}
              onChange={(event) => updateConfig({ apiUrl: event.target.value })}
            />
            <input
              value={config.apiKey}
              type="password"
              placeholder="API Key"
              style={styles.configInput}
              onChange={(event) => updateConfig({ apiKey: event.target.value })}
            />
          </div>
          <span style={styles.modelLabel}>{config.model || '未配置模型'}</span>
        </div>
      </div>
    </div>
  )
}
