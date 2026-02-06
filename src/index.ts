import type { ESLint } from "eslint";
import packageJsoncRule, { clearFixedFiles } from "./rules/package-jsonc.js";

// Plugin metadata - hardcoded to avoid dependency on package.json
// This ensures the plugin works even when the project's package.json is missing
const PLUGIN_NAME = "eslint-plugin-package-jsonc";
const PLUGIN_VERSION = "1.0.4";

const plugin: ESLint.Plugin = {
    meta: {
        name: PLUGIN_NAME,
        version: PLUGIN_VERSION,
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
