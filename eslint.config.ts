import { includeIgnoreFile } from "@eslint/compat";
import js from "@eslint/js";
import type { Linter } from "eslint";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import tseslint from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, ".gitignore");

const eslintConfig: Linter.Config[] = [
    {
        name: "Ignore dist folder",
        ignores: ["dist/**"],
    },
    {
        name: "js/recommended",
        files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.mjs"],
        ...js.configs.recommended,
    },
    {
        name: "Refine js rules for ES modules",
        rules: {
            "no-console": "off",
        },
    },
    ...tseslint.configs.recommended,
    {
        name: "Refine typescript-eslint rules",
        rules: {
            "@typescript-eslint/no-unused-vars": "off",
        },
    },
    {
        name: "Make tseslint works with type linting",
        languageOptions: {
            parserOptions: {
                projectService: {
                    allowDefaultProject: [
                        "*.js",
                        "*.mjs",
                        "*.cjs",
                        "*.config.ts",
                        "test/*.js",
                    ],
                },
            },
        },
    },
    {
        name: "Config files (CommonJS style)",
        files: ["*.config.js"],
        languageOptions: {
            globals: globals.commonjs,
        },
    },
    {
        name: "Test files (Node.js)",
        files: ["test/**/*.js"],
        languageOptions: {
            globals: globals.node,
        },
    },
    includeIgnoreFile(gitignorePath, "Use .gitignore to ignore"),
];

export default eslintConfig;
