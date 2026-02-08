# eslint-plugin-package-jsonc

An ESLint plugin that ensures `package.json` is consistent with `package.jsonc`.

## Installation

```bash
npm install --save-dev eslint-plugin-package-jsonc jsonc-eslint-parser
```

## Usage

Add the plugin to your ESLint configuration:

### Flat Config (eslint.config.js)

```javascript
import jsoncParser from "jsonc-eslint-parser";
import packageJsonc from "eslint-plugin-package-jsonc";

export default [
    // Configure the parser for JSON/JSONC files (handles comments, trailing commas)
    {
        files: ["**/*.json", "**/*.jsonc"],
        languageOptions: {
            parser: jsoncParser,
        },
    },
    // Add package-jsonc/sync rule for package.jsonc files
    {
        // Use "**/package.jsonc" if you have packages in subdirectories (monorepo)
        files: ["package.jsonc"],
        plugins: {
            "package-jsonc": packageJsonc,
        },
        rules: {
            "package-jsonc/sync": "error",
        },
    },
];
```

> **Note:** Use `"**/package.jsonc"` if you have packages in subdirectories (monorepo).

## Rule: `package-jsonc/sync`

This rule ensures that `package.jsonc` is the single source of truth for your package configuration.

It enforces the following:

1.  **Invalid `package.jsonc`**: If `package.jsonc` contains invalid JSON (syntax errors), the rule reports an error. This is not auto-fixable.
2.  **Inconsistent `package.json`**: If `package.jsonc` is valid, the rule compares it with `package.json`. If `package.json` is missing, invalid, or inconsistent with `package.jsonc`, the rule reports an error. **This is auto-fixable.**

### Fix Mode

When running ESLint with the `--fix` flag, the plugin will automatically generate or update `package.json` to match `package.jsonc`.

```bash
eslint package.jsonc --fix
```

## How It Works

1.  When linting `package.jsonc`, it uses `jsonc-eslint-parser` to parse the content.
2.  If `package.jsonc` is valid, it compares the parsed content with `package.json`.
3.  If they differ (or `package.json` is missing/invalid), it reports an error.
4.  In fix mode, it writes the normalized JSON from `package.jsonc` to `package.json`.

## Why Use This?

- **Comments in package.json**: JSONC allows you to add comments to your package configuration while maintaining a standard `package.json` for npm compatibility.
- **Single source of truth**: `package.jsonc` becomes the source of truth, and `package.json` is auto-generated.

## Hints

You can use eslint-plugin-package-json as you let AI fix related errors in package.jsonc rather than package.json.
