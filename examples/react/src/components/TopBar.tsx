import type { CSSProperties } from 'react'

export interface TopBarProps {
  title?: string
  autosaveTime?: string
  zoomPercent?: number
  editing?: boolean
  onShare?: () => void
  onTemplates?: () => void
  onToggleEdit?: () => void
  onAiDraw?: () => void
  onNewChat?: () => void
  onExit?: () => void
}

const avatarColors = ['var(--primary)', '#52c41a', '#fa8c16']
const avatarLetters = ['张', '李', '王']

const styles: Record<string, CSSProperties> = {
  bar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    padding: '0 16px',
    background: '#fff',
    borderBottom: '1px solid #e8e8e8',
    flexShrink: 0,
    userSelect: 'none',
    gap: 16,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  brand: {
    fontSize: 15,
    fontWeight: 700,
    color: 'var(--primary)',
    letterSpacing: '0.5px',
  },
  divider: {
    color: '#d9d9d9',
    fontSize: 18,
    margin: '0 2px',
  },
  title: {
    fontSize: 14,
    fontWeight: 500,
    color: '#333',
    maxWidth: 200,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  autosave: {
    fontSize: 11,
    color: '#bbb',
    whiteSpace: 'nowrap',
  },
  center: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  avatars: {
    display: 'flex',
    alignItems: 'center',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: 12,
    fontWeight: 500,
    border: '2px solid #fff',
    marginLeft: -8,
  },
  avatarMore: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: '#f0f0f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    color: '#999',
    border: '2px solid #fff',
    marginLeft: -8,
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  btn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    height: 32,
    padding: '0 10px',
    border: '1px solid #d9d9d9',
    borderRadius: 6,
    background: '#fff',
    cursor: 'pointer',
    fontSize: 13,
    color: '#555',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  textOnly: {
    border: 'none',
    padding: '0 6px',
    color: '#999',
    fontSize: 13,
    height: 'auto',
    minWidth: 'auto',
    background: 'transparent',
  },
  active: {
    background: 'var(--primary-bg)',
    borderColor: 'var(--primary)',
    color: 'var(--primary)',
  },
  primary: {
    background: 'var(--primary)',
    borderColor: 'var(--primary)',
    color: '#fff',
    fontWeight: 500,
  },
  primaryOutline: {
    borderColor: 'var(--primary)',
    color: 'var(--primary)',
  },
  iconOnly: {
    padding: 0,
    width: 32,
    justifyContent: 'center',
  },
  zoom: {
    fontSize: 12,
    color: '#888',
    background: '#f5f5f5',
    padding: '4px 8px',
    borderRadius: 6,
  },
}

export default function TopBar({
  title = '未命名图表',
  autosaveTime = '10:24',
  zoomPercent = 100,
  editing = false,
  onShare,
  onTemplates,
  onToggleEdit,
  onAiDraw,
  onNewChat,
  onExit,
}: TopBarProps) {
  return (
    <div style={styles.bar}>
      <div style={styles.left}>
        <div style={styles.logo}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="6" fill="var(--primary)" />
            <path d="M7 8h10M7 12h10M7 16h6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span style={styles.brand}>UniDraw</span>
        </div>
        <button type="button" style={{ ...styles.btn, ...styles.textOnly }} onClick={onExit}>退出</button>
        <span style={styles.divider}>|</span>
        <span style={styles.title}>{title}</span>
        <span style={styles.autosave}>已自动保存 {autosaveTime}</span>
      </div>

      <div style={styles.center}>
        <div style={styles.avatars}>
          {avatarLetters.map((letter, index) => (
            <div
              key={letter}
              style={{
                ...styles.avatar,
                marginLeft: index === 0 ? 0 : -8,
                background: avatarColors[index],
              }}
            >
              {letter}
            </div>
          ))}
          <div style={styles.avatarMore}>+12</div>
        </div>
      </div>

      <div style={styles.right}>
        <button type="button" style={styles.btn} onClick={onShare}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
          分享
        </button>
        <button type="button" style={styles.btn} onClick={onTemplates}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>
          模板
        </button>
        <button type="button" style={editing ? { ...styles.btn, ...styles.active } : styles.btn} onClick={onToggleEdit}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
          编辑
        </button>
        <button type="button" style={{ ...styles.btn, ...styles.iconOnly }} title="搜索">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        </button>
        <button type="button" style={{ ...styles.btn, ...styles.iconOnly }} title="帮助">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
        </button>
        <span style={styles.zoom}>{zoomPercent}%</span>
        <button type="button" style={{ ...styles.btn, ...styles.primary }} onClick={onAiDraw}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
          AI 绘图
        </button>
        <button type="button" style={{ ...styles.btn, ...styles.primaryOutline }} onClick={onNewChat}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          新建对话
        </button>
      </div>
    </div>
  )
}
