# eslint-plugin-package-jsonc

An ESLint plugin that ensures `package.json` is consistent with `package.jsonc`.

## Installation

```bash
npm install --save-dev eslint-plugin-package-jsonc eslint-plugin-jsonc
```

## Usage

Add the plugin to your ESLint configuration:

### Flat Config (eslint.config.js)

```javascript
import jsonc from "eslint-plugin-jsonc";
import packageJsonc from "eslint-plugin-package-jsonc";

export default [
    // Use eslint-plugin-jsonc to parse JSONC files (handles comments, trailing commas)
    ...jsonc.configs["flat/recommended-with-jsonc"],
    // Add package-jsonc/sync rule for package.jsonc and package.json files
    {
        files: ["**/package.jsonc", "**/package.json"],
        plugins: {
            "package-jsonc": packageJsonc,
        },
        rules: {
            "package-jsonc/sync": "error",
        },
    },
];
```

## Rule: `package-jsonc/sync`

This rule ensures that `package.jsonc` is the single source of truth for your package configuration.

It enforces the following:

1.  **Missing `package.jsonc`**: If `package.json` exists but `package.jsonc` does not, the rule reports an error. This is not auto-fixable.
2.  **Invalid `package.jsonc`**: If `package.jsonc` exists but contains invalid JSON (syntax errors), the rule reports an error. This is not auto-fixable.
3.  **Inconsistent `package.json`**: If `package.jsonc` is valid, the rule compares it with `package.json`. If `package.json` is invalid, or inconsistent with `package.jsonc`, the rule reports an error. **This is auto-fixable.**

### Fix Mode

When running ESLint with the `--fix` flag, the plugin will automatically generate or update `package.json` to match `package.jsonc`.

```bash
eslint package.jsonc package.json --fix
```

## How It Works

1.  When linting `package.json`, checks if `package.jsonc` exists.
2.  When linting `package.jsonc`, it uses `jsonc-eslint-parser` to parse the content.
3.  If `package.jsonc` is valid, it compares the parsed content with `package.json`.
4.  If they differ, it reports an error.
5.  In fix mode, it writes the normalized JSON from `package.jsonc` to `package.json`.

## Why Use This?

- **Comments in package.json**: JSONC allows you to add comments to your package configuration while maintaining a standard `package.json` for npm compatibility.
- **Single source of truth**: `package.jsonc` becomes the source of truth, and `package.json` is auto-generated.

## Hints

You can use eslint-plugin-package-json as you let AI fix related errors in package.jsonc rather than package.json.
