import type { Rule } from "eslint";
import * as fs from "node:fs";
import path from "node:path";

// Track which files have been fixed in this ESLint run to avoid circular fixes
const fixedFiles = new Set<string>();

/**
 * Indentation level for JSON stringification.
 */
const JSON_INDENT = 2;

/**
 * Parse JSONC content (JSON with Comments) into a JavaScript object.
 * Removes single-line and multi-line comments.
 * @param content - The JSONC content
 * @returns The parsed JSON object
 */
function parseJSONC(content: string): Record<string, unknown> {
    // Remove single-line comments (// ...)
    let cleaned = content.replaceAll(/\/\/.*$/gmu, "");
    // Remove multi-line comments (/* ... */)
    cleaned = cleaned.replaceAll(/\/\*[\S\s]*?\*\//gu, "");
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
    return `${JSON.stringify(object, null, JSON_INDENT)}\n`;
}

/**
 * Check if package.json needs to be updated.
 * This is called during the fix phase to avoid circular fixes.
 */
function needsFix(packageJsonPath: string, normalizedJsonc: string): boolean {
    try {
        const content = fs.readFileSync(packageJsonPath);
        const data = JSON.parse(content.toString()) as Record<string, unknown>;
        return normalizedJsonc !== getNormalizedJson(data);
    } catch {
        // File doesn't exist or is invalid
        return true;
    }
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
                "package.json does not exist but package.jsonc does. Run 'npx eslint package.jsonc --fix' to generate it.",
            inconsistentPackageJson:
                "package.json is inconsistent with package.jsonc. Run 'npx eslint package.jsonc --fix' to update it.",
        },
    },

    create(context: Rule.RuleContext) {
        const { filename } = context;
        const basename = path.basename(filename);

        // Only process package.jsonc files
        if (basename !== "package.jsonc") {
            return {};
        }

        const directory = path.dirname(filename);
        const packageJsonPath = path.join(directory, "package.json");

        return {
            Program(node) {
                const { sourceCode } = context;
                const jsoncContent = sourceCode.getText();

                let jsoncData: Record<string, unknown>;
                try {
                    jsoncData = parseJSONC(jsoncContent);
                } catch {
                    // If package.jsonc has syntax errors, let other rules handle it
                    return;
                }

                const normalizedJsonc = getNormalizedJson(jsoncData);

                // Check if package.json exists and is consistent
                let isConsistent = false;
                try {
                    const packageJsonContent = fs.readFileSync(packageJsonPath);
                    const packageJsonData = JSON.parse(
                        packageJsonContent.toString(),
                    ) as Record<string, unknown>;
                    isConsistent =
                        normalizedJsonc === getNormalizedJson(packageJsonData);
                } catch {
                    // package.json does not exist or is invalid
                }

                if (isConsistent) {
                    return;
                }

                // Report the error with a fixer
                const messageId = fs.existsSync(packageJsonPath)
                    ? "inconsistentPackageJson"
                    : "missingPackageJson";

                context.report({
                    node,
                    messageId,
                    fix(fixer) {
                        // Check if we've already fixed this file in this run
                        if (fixedFiles.has(filename)) {
                            return null;
                        }

                        // Check if fix is actually needed
                        if (!needsFix(packageJsonPath, normalizedJsonc)) {
                            fixedFiles.add(filename);
                            return null;
                        }

                        // Apply the fix
                        fixedFiles.add(filename);
                        fs.writeFileSync(
                            packageJsonPath,
                            normalizedJsonc,
                            "utf8",
                        );

                        // Return null to indicate no source text changes
                        // The actual fix happened to a different file (package.json)
                        return null;
                    },
                });
            },
        };
    },
};

// Export a function to clear the fixed files set (for testing)
export function clearFixedFiles(): void {
    fixedFiles.clear();
}

export default rule;
