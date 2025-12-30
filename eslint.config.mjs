import standardConfig from 'eslint-config-standard-kit'

export default [
  ...standardConfig({
    prettier: true,
    sortImports: true,
    jsx: false,
    node: true,
    react: false,
    typescript: true
  }),
  {
    // Add your own settings here
    rules: {
      'no-redeclare': 'off',
      '@typescript-eslint/no-redeclare': 'error'
    }
  },

  {
    ignores: ['dist']
  }
]
