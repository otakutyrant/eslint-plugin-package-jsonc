import type { ESLint } from "eslint";
import { createRequire } from "node:module";
import packageJsoncRule, { clearFixedFiles } from "./rules/package-jsonc.js";

// Create require function for ESM to read our own package.json
// This ensures the plugin has its own metadata, avoiding the chicken-and-egg
// problem where the plugin can't run if the project's package.json is missing.
const require = createRequire(import.meta.url);
const { name, version } = require("../package.json") as {
    name: string;
    version: string;
};

const plugin: ESLint.Plugin = {
    meta: {
        name,
        version,
    },
    rules: {
        sync: packageJsoncRule,
    },
    configs: {
        recommended: {
            plugins: ["package-jsonc"],
            rules: {
                "package-jsonc/sync": "error",
            },
        },
    },
};

// Export the clearFixedFiles function for testing
(
    plugin as ESLint.Plugin & { clearFixedFiles?: typeof clearFixedFiles }
).clearFixedFiles = clearFixedFiles;

export default plugin;
