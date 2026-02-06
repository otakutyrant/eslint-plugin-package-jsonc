import { ESLint } from "eslint";
import * as espree from "espree";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import plugin from "../dist/index.js";

/**
 * Cast the plugin's clearFixedFiles function to the correct type.
 */
const { clearFixedFiles } = plugin as {
    clearFixedFiles?: () => void;
};

/**
 * Create a temporary directory for testing.
 * @returns The path to the temporary directory.
 */
function createTemporaryDirectory(): string {
    return fs.mkdtempSync(path.join(os.tmpdir(), "eslint-test-"));
}

/**
 * Clean up the temporary directory.
 * @param temporaryDirectory - The path to the temporary directory.
 */
function cleanupTemporaryDirectory(temporaryDirectory: string): void {
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
}

/**
 * Parse JSONC content by removing comments and parsing.
 * @param content - The JSONC content.
 * @returns The parsed JSON.
 */
function parseJSONC(content: string): unknown {
    // Remove single-line comments
    let cleaned = content.replaceAll(/\/\/.*$/gmu, "");
    // Remove multi-line comments
    cleaned = cleaned.replaceAll(/\/\*[\S\s]*?\*\//gu, "");
    return JSON.parse(cleaned) as unknown;
}

describe("package-jsonc sync rule", () => {
    it("should correctly parse JSONC content by removing comments", () => {
        const testContent = `{
    "name": "test-package",
    // This is a comment
    "version": "1.0.0",
    /* Multi-line
       comment */
    "description": "A test package"
  }`;

        const result = parseJSONC(testContent);

        expect(result).toStrictEqual({
            name: "test-package",
            version: "1.0.0",
            description: "A test package",
        });
    });

    it("should generate package.json when it is missing", async () => {
        const temporaryDirectory = createTemporaryDirectory();
        const packageJsoncPath = path.join(temporaryDirectory, "package.jsonc");
        const packageJsonPath = path.join(temporaryDirectory, "package.json");

        const packageJsoncContent = `{
    "name": "test-package",
    // This is a comment
    "version": "1.0.0"
  }`;

        fs.writeFileSync(packageJsoncPath, packageJsoncContent, "utf8");

        // Verify package.json doesn't exist
        expect(fs.existsSync(packageJsonPath)).toBe(false);

        // Create ESLint instance with our plugin, using tempDir as cwd
        const eslint = new ESLint({
            cwd: temporaryDirectory,
            overrideConfigFile: true,
            overrideConfig: {
                files: ["**/*.jsonc"],
                plugins: {
                    "package-jsonc": plugin,
                },
                rules: {
                    "package-jsonc/sync": "error",
                },
                languageOptions: {
                    parser: {
                        parseForESLint(code: string) {
                            // Wrap JSON in a JavaScript expression so espree can parse it
                            const wrappedCode = `(${code})`;
                            const ast = espree.parse(wrappedCode, {
                                ecmaVersion: "latest",
                                loc: true,
                                range: true,
                                tokens: true,
                                comment: true,
                            });
                            return {
                                ast,
                                services: {},
                                visitorKeys: null,
                                scopeManager: null,
                            };
                        },
                    },
                },
            },
            fix: true,
        });

        // Run ESLint on the package.jsonc file
        await eslint.lintFiles(["package.jsonc"]);

        // Check that package.json was created
        expect(fs.existsSync(packageJsonPath)).toBe(true);

        const packageJsonContent = fs.readFileSync(packageJsonPath);
        const packageJsonData = JSON.parse(packageJsonContent.toString()) as {
            name: string;
            version: string;
        };

        expect(packageJsonData).toStrictEqual({
            name: "test-package",
            version: "1.0.0",
        });

        cleanupTemporaryDirectory(temporaryDirectory);
        clearFixedFiles?.();
    });

    it("should update package.json when it is inconsistent", async () => {
        const temporaryDirectory = createTemporaryDirectory();
        const packageJsoncPath = path.join(temporaryDirectory, "package.jsonc");
        const packageJsonPath = path.join(temporaryDirectory, "package.json");

        const packageJsoncContent = `{
    "name": "test-package",
    // Updated version
    "version": "2.0.0"
  }`;

        const indentation = 2;
        const oldPackageJsonContent = `${JSON.stringify(
            {
                name: "test-package",
                version: "1.0.0",
            },
            null,
            indentation,
        )}\n`;

        fs.writeFileSync(packageJsoncPath, packageJsoncContent, "utf8");
        fs.writeFileSync(packageJsonPath, oldPackageJsonContent, "utf8");

        const eslint = new ESLint({
            cwd: temporaryDirectory,
            overrideConfigFile: true,
            overrideConfig: {
                files: ["**/*.jsonc"],
                plugins: {
                    "package-jsonc": plugin,
                },
                rules: {
                    "package-jsonc/sync": "error",
                },
                languageOptions: {
                    parser: {
                        parseForESLint(code: string) {
                            const wrappedCode = `(${code})`;
                            const ast = espree.parse(wrappedCode, {
                                ecmaVersion: "latest",
                                loc: true,
                                range: true,
                                tokens: true,
                                comment: true,
                            });
                            return {
                                ast,
                                services: {},
                                visitorKeys: null,
                                scopeManager: null,
                            };
                        },
                    },
                },
            },
            fix: true,
        });

        await eslint.lintFiles(["package.jsonc"]);

        // Check that package.json was updated
        const packageJsonContent = fs.readFileSync(packageJsonPath);
        const packageJsonData = JSON.parse(packageJsonContent.toString()) as {
            name: string;
            version: string;
        };

        expect(packageJsonData.version).toBe("2.0.0");

        cleanupTemporaryDirectory(temporaryDirectory);
        clearFixedFiles?.();
    });

    it("should not report error when files are consistent", async () => {
        const temporaryDirectory = createTemporaryDirectory();
        const packageJsoncPath = path.join(temporaryDirectory, "package.jsonc");
        const packageJsonPath = path.join(temporaryDirectory, "package.json");

        const packageJsoncContent = `{
    "name": "test-package",
    "version": "1.0.0"
  }`;

        // Generate what the expected package.json should be
        const indentation = 2;
        const expectedPackageJson = `${JSON.stringify(
            parseJSONC(packageJsoncContent),
            null,
            indentation,
        )}\n`;

        fs.writeFileSync(packageJsoncPath, packageJsoncContent, "utf8");
        fs.writeFileSync(packageJsonPath, expectedPackageJson, "utf8");

        const eslint = new ESLint({
            cwd: temporaryDirectory,
            overrideConfigFile: true,
            overrideConfig: {
                files: ["**/*.jsonc"],
                plugins: {
                    "package-jsonc": plugin,
                },
                rules: {
                    "package-jsonc/sync": "error",
                },
                languageOptions: {
                    parser: {
                        parseForESLint(code: string) {
                            const wrappedCode = `(${code})`;
                            const ast = espree.parse(wrappedCode, {
                                ecmaVersion: "latest",
                                loc: true,
                                range: true,
                                tokens: true,
                                comment: true,
                            });
                            return {
                                ast,
                                services: {},
                                visitorKeys: null,
                                scopeManager: null,
                            };
                        },
                    },
                },
            },
            fix: false,
        });

        const results = await eslint.lintFiles(["package.jsonc"]);

        // Check that there are no errors
        const errorCount = results.reduce(
            (sum, result) => sum + result.errorCount,
            0,
        );

        expect(errorCount).toBe(0);

        cleanupTemporaryDirectory(temporaryDirectory);
        clearFixedFiles?.();
    });
});
