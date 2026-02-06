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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(plugin as any).clearFixedFiles = clearFixedFiles;

export default plugin;
