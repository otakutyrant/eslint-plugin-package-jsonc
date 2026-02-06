# eslint-plugin-package-jsonc

An ESLint plugin that ensures `package.json` is consistent with `package.jsonc`.

## Installation

```bash
npm install --save-dev eslint-plugin-package-jsonc
```

## Usage

Add the plugin to your ESLint configuration:

### Flat Config (eslint.config.js)

```javascript
import packageJsonc from "eslint-plugin-package-jsonc";

// Custom parser for JSONC files
const jsoncParser = {
    meta: {
        name: "jsonc-plain-parser",
        version: "1.0.0",
    },
    parse: (code) => ({
        type: "Program",
        body: [],
        tokens: [],
        comments: [],
        range: [0, code.length],
        loc: {
            start: { line: 1, column: 0 },
            end: { line: code.split("\n").length, column: 0 },
        },
    }),
};

export default [
    {
        files: ["**/package.jsonc"],
        plugins: {
            "package-jsonc": packageJsonc,
        },
        rules: {
            "package-jsonc/sync": "error",
        },
        languageOptions: {
            parser: jsoncParser,
        },
    },
];
```

> **Note**: The `files` pattern and custom parser are required because ESLint's default TypeScript/JavaScript parser cannot parse `.jsonc` files. The custom parser returns a minimal AST that allows the rule to access the file's source code via `context.sourceCode.getText()`.

## Rule: `package-jsonc/sync`

This rule ensures that `package.json` is always in sync with `package.jsonc`:

- If `package.json` does not exist but `package.jsonc` does, the rule reports an error and can generate `package.json` when running with `--fix`.
- If `package.json` exists but has different content than what would be generated from `package.jsonc`, the rule reports an error and can update `package.json` when running with `--fix`.

### Fix Mode

When running ESLint with the `--fix` flag, the plugin will automatically:

1. Generate `package.json` if it doesn't exist
2. Update `package.json` if it's inconsistent with `package.jsonc`

```bash
eslint package.jsonc --fix
```

## How It Works

1. The plugin parses `package.jsonc` (JSON with comments) by stripping out comments
2. It compares the parsed content with the existing `package.json` (if any)
3. If they differ, it reports an error
4. In fix mode, it writes the normalized JSON to `package.json`

## Why Use This?

- **Comments in package.json**: JSONC allows you to add comments to your package configuration while maintaining a standard `package.json` for npm compatibility.
- **Single source of truth**: `package.jsonc` becomes the source of truth, and `package.json` is auto-generated.
