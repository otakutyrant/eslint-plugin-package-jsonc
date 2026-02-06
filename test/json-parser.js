// Simple JSON parser for ESLint
module.exports = {
  parseForESLint(code) {
    return {
      ast: {
        type: 'Program',
        start: 0,
        end: code.length,
        range: [0, code.length],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: code.split('\n').length, column: code.length }
        },
        body: [],
        sourceType: 'module',
        tokens: [],
        comments: [],
        parent: null
      },
      services: {},
      visitorKeys: {
        Program: []
      },
      scopeManager: null
    };
  }
};
