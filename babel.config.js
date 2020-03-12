module.exports = {
  presets: [
    'vca-jsx',
    ['@vue/app',
      {
        "useBuiltIns": "entry"
      }],
  ],
  env: {
    test: {
      plugins: ["require-context-hook"]
    }
  }
}
