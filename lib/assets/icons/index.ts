/**
 * SVG 图标资源统一导出
 *
 * 所有 SVG 文件通过 Vite `?raw` 导入为字符串，
 * key 格式为 `<dir>/<filename>`，例如 `toolbar/undo`、`connector/smooth`。
 */

const modules = import.meta.glob<true, string, string>(
  './**/*.svg',
  { eager: true, query: '?raw', import: 'default' },
)

export const icons: Record<string, string> = {}

for (const [rawPath, content] of Object.entries(modules)) {
  // rawPath: './toolbar/undo.svg' → 'toolbar/undo'
  const key = rawPath
    .replace(/^\.\//, '')
    .replace(/\.svg$/, '')
  icons[key] = content
}
