You are a senior full-stack developer. I offer you some information and you complete my request.

This project is an ESLint plugin (`eslint-plugin-package-jsonc`) that ensures `package.json` is consistent with `package.jsonc`. It parses JSONC files (JSON with Comments), detects missing or inconsistent `package.json`, and auto-generates `package.json` from `package.jsonc` when running ESLint with `--fix`.

Before completing my request, read `package.json` to understand the project structure and scripts (test, lint, format).

# Project Structure

```
├── index.js                 # Plugin entry point
├── rules/
│   └── package-jsonc.js     # The sync rule implementation
├── test/
│   ├── json-parser.js       # Test helper parser
│   └── package-jsonc.test.js # Test suite
├── package.json             # Package configuration
├── eslint.config.ts         # ESLint configuration (TypeScript)
└── prettier.config.ts       # Prettier configuration
```

# Rules

- When I require you to git commit, use Conventional Commits style.
- When generating code, add comments properly.
- After modifying code, use scripts from `package.json` to ensure lint and tests pass, and format them finally.
- Do not use `console.log` in the rule implementation; use ESLint's reporting mechanism instead.
