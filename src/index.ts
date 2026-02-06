import type { ESLint } from "eslint";
import packageJsoncRule, { clearFixedFiles } from "./rules/package-jsonc.js";

const plugin: ESLint.Plugin = {
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
