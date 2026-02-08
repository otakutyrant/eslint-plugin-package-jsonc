# eslint-plugin-package-jsonc

An ESLint plugin that ensures `package.json` is consistent with `package.jsonc`. You can use comments and trailing commas in your package.jsonc, and the later becomes the source of truth.

You can use eslint-plugin-package-json as you let AI fix related errors in package.jsonc rather than package.json.

## Installation

```bash
npm install --save-dev eslint-plugin-package-jsonc jsonc-eslint-parser
```

## Flat Config (eslint.config.js)

```javascript
import jsoncParser from "jsonc-eslint-parser";
import packageJsonc from "eslint-plugin-package-jsonc";

export default [
    // Configure the parser for JSON/JSONC files (handles comments, trailing commas)
    {
        files: ["package.jsonc"],
        languageOptions: {
            parser: jsoncParser,
        },
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

1.  **Invalid `package.jsonc`**: If `package.jsonc` contains invalid JSON (syntax errors), the rule reports an error. This is not auto-fixable.
2.  **Inconsistent `package.json`**: If `package.jsonc` is valid, the rule compares it with `package.json`. If `package.json` is missing, invalid, or inconsistent with `package.jsonc`, the rule reports an error. **This is auto-fixable that generate `package.json` from `package.jsonc` immediately.**

## How It Works

1.  When linting `package.jsonc`, it uses `jsonc-eslint-parser` to parse the content.
2.  If `package.jsonc` is valid, it compares the parsed content with `package.json`.
3.  If they differ (or `package.json` is missing/invalid), it reports an error.
4.  In fix mode, it writes the normalized JSON from `package.jsonc` to `package.json`.
