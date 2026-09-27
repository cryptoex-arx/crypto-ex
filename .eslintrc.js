module.exports = {
  root: true,
  extends: '@react-native',
  plugins: ['simple-import-sort'],
  rules: {
    // Consistent, auto-fixable import/export ordering.
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    // Logging goes through src/utils/logger so it can be stripped/redacted centrally.
    'no-console': 'error',
    eqeqeq: ['error', 'always', { null: 'ignore' }],
    'no-var': 'error',
    'prefer-const': 'error',
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            ignoreRestSiblings: true,
          },
        ],
      },
    },
  ],
};
