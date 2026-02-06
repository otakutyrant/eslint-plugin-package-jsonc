const packageJsoncRule = require('./rules/package-jsonc');

module.exports = {
  rules: {
    'sync': packageJsoncRule
  },
  configs: {
    recommended: {
      plugins: ['package-jsonc'],
      rules: {
        'package-jsonc/sync': 'error'
      }
    }
  }
};
