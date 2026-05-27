/**
 * 生成全局唯一 ID
 */
export function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * 生成短 ID（用于节点/边）
 */
export function shortId(prefix = ''): string {
  const id = Math.random().toString(36).substring(2, 10)
  return prefix ? `${prefix}-${id}` : id
}
