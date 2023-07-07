module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/essential',
    'eslint:recommended'
  ],
  rules: {
    'no-console': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'vue/multi-word-component-names': 'off',
    'vue/no-reserved-keys': 'off',
    'no-unused-vars': 'off'
  },
  parserOptions: {
    parser: '@babel/eslint-parser',
    requireConfigFile: false
  }
}
