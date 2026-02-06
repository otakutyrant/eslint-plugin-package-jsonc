import { fileURLToPath } from "node:url";

import { includeIgnoreFile } from "@eslint/compat";
import js from "@eslint/js";
import vitest from "@vitest/eslint-plugin";
import packageJsonc from "eslint-plugin-package-jsonc";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

const gitignorePath = fileURLToPath(new URL(".gitignore", import.meta.url));

// Custom parser for JSONC files
const jsoncParser = {
    meta: {
        name: "jsonc-plain-parser",
        version: "1.0.0",
    },
    parse: (code: string) => ({
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

const eslintConfig = defineConfig(
    {
        name: "js/all",
        files: ["**/*.ts", "**/*.tsx"],
        plugins: { js },
        rules: js.configs.all.rules,
    },
    {
        name: "Refine js rules",
        files: ["**/*.ts", "**/*.tsx"],
        rules: {
            "capitalized-comments": "off",
            "consistent-return": "off",
            "func-style": "off",
            "id-length": "off",
            "init-declarations": "off",
            "max-lines": "off",
            "max-lines-per-function": "off",
            "max-statements": "off",
            "new-cap": "off",
            "no-console": "warn",
            "no-else-return": "off",
            "no-inline-comments": "off",
            "no-magic-numbers": ["warn", { ignore: [0, 1] }],
            "no-plusplus": "off",
            "no-ternary": "off",
            "no-undefined": "off",
            "no-unused-vars": "off",
            "no-useless-undefined": "off",
            "one-var": "off",
            "preserve-caught-error": "off",
            "prevent-abbrevations": "off",
            "require-await": "off",
            "sort-imports": "off",
            "sort-keys": "off",
            "vars-on-top": "off",
            "no-void": "off", // I know what I am doing, and I use it to solve -no-misused-promises problems
        },
    },
    // TypeScript ESLint configs - apply only to TS files
    ...tseslint.configs.strictTypeChecked.map((config) => ({
        ...config,
        files: ["**/*.ts", "**/*.tsx"],
    })),
    ...tseslint.configs.stylisticTypeChecked.map((config) => ({
        ...config,
        files: ["**/*.ts", "**/*.tsx"],
    })),
    {
        name: "Refine typescript-eslint rules",
        files: ["**/*.ts", "**/*.tsx"],
        rules: {
            "@typescript-eslint/strict-boolean-expressions": "error",
            "@typescript-eslint/no-shadow": "error",
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/restrict-template-expressions": "off",
            "@typescript-eslint/non-nullable-type-assertion-style": "off", // I prefer `as` to `!`
        },
    },
    {
        name: "Make tseslint works with type linting",
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
            parserOptions: {
                projectService: {
                    allowDefaultProject: [
                        "eslint.config.ts",
                        "prettier.config.ts",
                        "test/package-jsonc.test.ts",
                    ],
                },
            },
        },
    },
    // eslint-plugin-unicorn configs - apply only to JS/TS files
    {
        name: "eslint-plugin-unicorn/all",
        files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx", "**/*.mjs"],
        ...eslintPluginUnicorn.configs.all,
    },
    {
        name: "Refine unicorn rules",
        files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx", "**/*.mjs"],
        rules: {
            "unicorn/no-useless-undefined": [
                "error",
                { checkArguments: false },
            ],
            "unicorn/no-keyword-prefix": "off",
            "unicorn/prefer-ternary": "off",
            "unicorn/no-negated-condition": "off",
            "unicorn/no-null": "off",
        },
    },
    {
        name: "vitest/all",
        files: ["**/*.test.ts"],
        plugins: { vitest },
        rules: {
            ...vitest.configs.all.rules,
            "vitest/max-expects": ["warn", { max: 20 }],
            "vitest/prefer-expect-assertions": "off",
        },
    },
    // package-jsonc rule - apply only to package.jsonc files
    {
        name: "package-jsonc/sync",
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
    includeIgnoreFile(gitignorePath, "Use .gitignore to ignore"),
    {
        name: "Ignore non-TypeScript files",
        ignores: [
            "postcss.config.mjs", // As it is not TypeScript while I use projectService
            // All test files are now TypeScript
        ],
    },
);

export default eslintConfig;
