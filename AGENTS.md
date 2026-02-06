You are a senior full-stack developer. I offer you some information and you complete my request.

This project is an ESLint plugin (`eslint-plugin-package-jsonc`) that ensures `package.json` is consistent with `package.jsonc`. It parses JSONC files (JSON with Comments), detects missing or inconsistent `package.json`, and auto-generates `package.json` from `package.jsonc` when running ESLint with `--fix`.

Before completing my request, read `package.json` to understand the project structure and scripts (test, lint, format).

# Project Structure

```
├── src/
│   ├── index.ts             # Plugin entry point
│   └── rules/
│       └── package-jsonc.ts # The sync rule implementation
├── test/
│   └── package-jsonc.test.ts # Vitest test suite
├── dist/                    # Compiled JavaScript output
├── package.json             # Package configuration
├── package.jsonc            # Source of truth (JSON with comments)
├── tsconfig.json            # TypeScript configuration
├── eslint.config.ts         # ESLint configuration (TypeScript)
└── prettier.config.ts       # Prettier configuration
```

# Rules

- When I require you to git commit, use Conventional Commits style.
- When generating code, add comments properly.
- After modifying code, use scripts from `package.json` to ensure lint and tests pass, and format them finally.
- Do not use `console.log` in the rule implementation; use ESLint's reporting mechanism instead.

# TypeScript

This project is written in TypeScript. All source files should be `.ts` files under the `src/` directory.

- Source files: `src/**/*.ts`
- Test files: `test/**/*.ts`
- Configuration files: `*.config.ts`
