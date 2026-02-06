import { fileURLToPath } from "node:url";

import { includeIgnoreFile } from "@eslint/compat";
import js from "@eslint/js";
import vitest from "@vitest/eslint-plugin";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

const gitignorePath = fileURLToPath(new URL(".gitignore", import.meta.url));

const eslintConfig = defineConfig(
    {
        name: "js/all",
        files: ["**/*.ts", "**/*.tsx"],
        plugins: { js },
        rules: js.configs.all.rules,
    },
    {
        name: "Refine js rules",
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
    tseslint.configs.strictTypeChecked,
    tseslint.configs.stylisticTypeChecked, // This extends `tseslint.configs.stylisticTypeChecked`'s `['./configs/eslintrc/base', './configs/eslintrc/eslint-recommended']` again, and it can't be helped. Maybe I can enable `tseslint.configs.all` instead in the future.
    {
        name: "Refine typescript-eslint rules",
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
        languageOptions: {
            parserOptions: {
                projectService: {
                    allowDefaultProject: [
                        "eslint.config.ts",
                        "prettier.config.ts",
                        "test/package-jsonc.test.js",
                    ],
                },
            },
        },
    },
    eslintPluginUnicorn.configs.all,
    {
        name: "Refine unicorn rules",
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
    includeIgnoreFile(gitignorePath, "Use .gitignore to ignore"),
    {
        name: "Ignore non-TypeScript files",
        ignores: [
            "postcss.config.mjs", // As it is not TypeScript while I use projectService
            "test/**/*.js", // JavaScript test files
        ],
    },
);

export default eslintConfig;
