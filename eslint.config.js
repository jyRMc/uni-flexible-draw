import antfu from '@antfu/eslint-config'

export default antfu({
  vue: true,
  typescript: true,
  markdown: false,
  formatters: {
    css: true,
    html: true,
  },
  ignores: [
    '**/dist',
    '**/node_modules',
    '**/*.d.ts',
    'docs/**',
    '**/*.md',
    'vitest.setup.ts',
    'src/__tests__/**',
    'server/**/*.test.mjs',
  ],
  rules: {
    'no-console': 'off',
    'antfu/top-level-function': 'off',
  },
})
