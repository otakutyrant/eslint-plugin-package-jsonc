import type { Rule } from "eslint";
import * as fs from "node:fs";
import * as path from "node:path";

// Track which files have been fixed in this ESLint run to avoid circular fixes
const fixedFiles = new Set<string>();

/**
 * Parse JSONC content (JSON with comments) into a JavaScript object.
 * Removes single-line and multi-line comments.
 * @param content - The JSONC content
 * @returns The parsed JSON object
 */
function parseJSONC(content: string): Record<string, unknown> {
    // Remove single-line comments (// ...)
    let cleaned = content.replace(/\/\/.*$/gm, "");
    // Remove multi-line comments (/* ... */)
    cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, "");
    // Parse the cleaned content as JSON
    return JSON.parse(cleaned) as Record<string, unknown>;
}

/**
 * Get the text representation of a value for comparison.
 * Normalizes JSON formatting for reliable comparison.
 * @param object - The object to stringify
 * @returns Normalized JSON string
 */
function getNormalizedJson(object: unknown): string {
    return JSON.stringify(object, null, 2) + "\n";
}

const rule: Rule.RuleModule = {
    meta: {
        type: "problem",
        docs: {
            description: "Ensure package.json is consistent with package.jsonc",
            category: "Possible Errors",
            recommended: true,
        },
        fixable: "code",
        schema: [],
        messages: {
            missingPackageJson:
                "package.json does not exist but package.jsonc does.",
            inconsistentPackageJson:
                "package.json is inconsistent with package.jsonc.",
        },
    },

    create(context: Rule.RuleContext) {
        const filename = context.getFilename();
        const basename = path.basename(filename);

        // Only process package.jsonc files
        if (basename !== "package.jsonc") {
            return {};
        }

        const directory = path.dirname(filename);
        const packageJsonPath = path.join(directory, "package.json");

        return {
            Program(node) {
                const sourceCode = context.getSourceCode();
                const jsoncContent = sourceCode.getText();

                let jsoncData: Record<string, unknown>;
                try {
                    jsoncData = parseJSONC(jsoncContent);
                } catch {
                    // If package.jsonc has syntax errors, let other rules handle it
                    return;
                }

                // Check if package.json exists
                let packageJsonExists = false;
                let packageJsonContent = "";
                try {
                    packageJsonContent = fs.readFileSync(
                        packageJsonPath,
                        "utf8",
                    );
                    packageJsonExists = true;
                } catch {
                    // package.json does not exist
                }

                const normalizedJsonc = getNormalizedJson(jsoncData);

                if (!packageJsonExists) {
                    // Check if we've already fixed this file in this run
                    if (fixedFiles.has(filename)) {
                        return;
                    }

                    context.report({
                        node,
                        messageId: "missingPackageJson",
                        fix(fixer) {
                            // Only apply the fix once per file per ESLint run
                            if (!fixedFiles.has(filename)) {
                                fixedFiles.add(filename);
                                fs.writeFileSync(
                                    packageJsonPath,
                                    normalizedJsonc,
                                    "utf8",
                                );
                            }
                            // Return a no-op fix that ESLint will recognize as applied
                            return fixer.insertTextAfter(node, "");
                        },
                    });
                    return;
                }

                // Parse package.json content
                let packageJsonData: unknown;
                try {
                    packageJsonData = JSON.parse(packageJsonContent);
                } catch {
                    // package.json has syntax errors, regenerate it
                    if (fixedFiles.has(filename)) {
                        return;
                    }

                    context.report({
                        node,
                        messageId: "inconsistentPackageJson",
                        fix(fixer) {
                            if (!fixedFiles.has(filename)) {
                                fixedFiles.add(filename);
                                fs.writeFileSync(
                                    packageJsonPath,
                                    normalizedJsonc,
                                    "utf8",
                                );
                            }
                            return fixer.insertTextAfter(node, "");
                        },
                    });
                    return;
                }

                // Compare the contents
                const normalizedJson = getNormalizedJson(packageJsonData);

                if (normalizedJsonc !== normalizedJson) {
                    // Check if we've already fixed this file
                    if (fixedFiles.has(filename)) {
                        return;
                    }

                    context.report({
                        node,
                        messageId: "inconsistentPackageJson",
                        fix(fixer) {
                            if (!fixedFiles.has(filename)) {
                                fixedFiles.add(filename);
                                fs.writeFileSync(
                                    packageJsonPath,
                                    normalizedJsonc,
                                    "utf8",
                                );
                            }
                            return fixer.insertTextAfter(node, "");
                        },
                    });
                }
            },
        };
    },
};

// Export a function to clear the fixed files set (for testing)
export function clearFixedFiles(): void {
    fixedFiles.clear();
}

export default rule;
