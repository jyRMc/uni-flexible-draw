import antfu from '@antfu/eslint-config'

export default antfu({
  vue: true,
  typescript: true,
  formatters: {
    css: true,
    html: true,
  },
  ignores: [
    '**/dist',
    '**/node_modules',
    '**/*.d.ts',
  ],
  rules: {
    'no-console': 'off',
    'antfu/top-level-function': 'off',
  },
})
