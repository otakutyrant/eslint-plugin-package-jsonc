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
    // Add package-jsonc/sync rule for package.jsonc files
    {
        files: ["**/package.jsonc"],
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

This rule ensures that `package.json` is always in sync with `package.jsonc`:

- If `package.json` exists but has different content than what would be generated from `package.jsonc`, the rule reports an error and can update `package.json` when running with `--fix`.

### Fix Mode

When running ESLint with the `--fix` flag, the plugin will automatically update `package.json` if it's inconsistent with `package.jsonc`.

```bash
eslint package.jsonc --fix
```

## How It Works

1. The plugin uses `jsonc-eslint-parser` (via `eslint-plugin-jsonc`) to parse `package.jsonc` with full support for comments and trailing commas
2. It compares the parsed content with the existing `package.json` (if any)
3. If they differ, it reports an error
4. In fix mode, it writes the normalized JSON to `package.json`

## Why Use This?

- **Comments in package.json**: JSONC allows you to add comments to your package configuration while maintaining a standard `package.json` for npm compatibility.
- **Single source of truth**: `package.jsonc` becomes the source of truth, and `package.json` is auto-generated.

## Hints

You can use eslint-plugin-package-json as you let AI fix related errors in package.jsonc rather than package.json.
