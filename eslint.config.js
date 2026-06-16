import antfu from '@antfu/eslint-config'

export default antfu({
  vue: true,
  typescript: true,
  markdown: false,
  formatters: {
    css: true,
    html: true,
  },
  rules: {
    'no-console': 'off',
    'antfu/top-level-function': 'off',
    'vue/custom-event-name-casing': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'ts/no-use-before-define': 'off',
    'unicorn/prefer-number-properties': 'off',
    'regexp/no-super-linear-backtracking': 'off',
  },
}, {
  ignores: [
    '**/dist',
    '**/node_modules',
    '**/*.d.ts',
    'docs/**',
    '**/*.md',
    'vitest.setup.ts',
    'src/__tests__/**',
    'server/**/*.test.mjs',
    'lib/**',
    'server/**',
    'scripts/**',
    'uni-runtime.js',
    'examples/**',
  ],
})
