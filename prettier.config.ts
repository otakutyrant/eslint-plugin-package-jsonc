import type { Config } from "prettier";

// Prettier applies .gitignore (if it is in the same directory with the working directory)
// and ignores node_modules by default, so it is unnecessary to configure them here
const prettierConfig: Config = {
    tabWidth: 4,
    plugins: ["prettier-plugin-organize-imports"],
};

export default prettierConfig;
