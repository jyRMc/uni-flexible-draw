/**
 * 轻量 Message 提示服务
 * 参考 Element UI Message 样式的原生 DOM 实现
 */

type MessageType = 'info' | 'warning' | 'error'

const CONTAINER_ID = 'ud-message-container'

function getContainer(): HTMLElement {
  let container = document.getElementById(CONTAINER_ID)
  if (!container) {
    container = document.createElement('div')
    container.id = CONTAINER_ID
    container.className = 'ud-message-container'
    document.body.appendChild(container)
  }
  return container
}

export function showMessage(
  text: string,
  type: MessageType = 'info',
  duration: number = 3000,
): void {
  const container = getContainer()

  const iconMap: Record<MessageType, string> = {
    info: 'ℹ',
    warning: '⚠',
    error: '✕',
  }

  const el = document.createElement('div')
  el.className = `ud-message ud-message--${type}`
  el.innerHTML = `<span class="ud-message__icon">${iconMap[type]}</span><span>${text}</span>`

  container.appendChild(el)

  // 入场动画：下一帧触发
  requestAnimationFrame(() => {
    el.classList.add('ud-message--visible')
  })

  if (duration > 0) {
    setTimeout(() => {
      el.classList.remove('ud-message--visible')
      el.addEventListener('transitionend', () => el.remove(), { once: true })
      // 兜底：transitionend 未触发时手动移除
      setTimeout(() => {
        if (el.parentNode) {
          el.remove()
        }
      }, 400)
    }, duration)
  }
}
