const fs = require('fs');
const path = require('path');

// Track which files have been fixed in this ESLint run to avoid circular fixes
const fixedFiles = new Set();

/**
 * Parse JSONC content (JSON with comments) into a JavaScript object.
 * Removes single-line and multi-line comments.
 * @param {string} content - The JSONC content
 * @returns {object} The parsed JSON object
 */
function parseJSONC(content) {
  // Remove single-line comments (// ...)
  let cleaned = content.replace(/\/\/.*$/gm, '');
  // Remove multi-line comments (/* ... */)
  cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
  // Parse the cleaned content as JSON
  return JSON.parse(cleaned);
}

/**
 * Get the text representation of a value for comparison.
 * Normalizes JSON formatting for reliable comparison.
 * @param {any} obj - The object to stringify
 * @returns {string} Normalized JSON string
 */
function getNormalizedJson(obj) {
  return JSON.stringify(obj, null, 2) + '\n';
}

const rule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Ensure package.json is consistent with package.jsonc',
      category: 'Possible Errors',
      recommended: true
    },
    fixable: 'code',
    schema: [],
    messages: {
      missingPackageJson: 'package.json does not exist but package.jsonc does.',
      inconsistentPackageJson: 'package.json is inconsistent with package.jsonc.'
    }
  },

  create(context) {
    const filename = context.getFilename();
    const basename = path.basename(filename);

    // Only process package.jsonc files
    if (basename !== 'package.jsonc') {
      return {};
    }

    const dir = path.dirname(filename);
    const packageJsonPath = path.join(dir, 'package.json');

    return {
      Program(node) {
        const sourceCode = context.getSourceCode();
        const jsoncContent = sourceCode.getText();

        let jsoncData;
        try {
          jsoncData = parseJSONC(jsoncContent);
        } catch (error) {
          // If package.jsonc has syntax errors, let other rules handle it
          return;
        }

        // Check if package.json exists
        let packageJsonExists = false;
        let packageJsonContent = '';
        try {
          packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
          packageJsonExists = true;
        } catch (error) {
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
            messageId: 'missingPackageJson',
            fix(fixer) {
              // Only apply the fix once per file per ESLint run
              if (!fixedFiles.has(filename)) {
                fixedFiles.add(filename);
                fs.writeFileSync(packageJsonPath, normalizedJsonc, 'utf8');
              }
              // Return a no-op fix that ESLint will recognize as applied
              return fixer.insertTextAfter(node, '');
            }
          });
          return;
        }

        // Parse package.json content
        let packageJsonData;
        try {
          packageJsonData = JSON.parse(packageJsonContent);
        } catch (error) {
          // package.json has syntax errors, regenerate it
          if (fixedFiles.has(filename)) {
            return;
          }
          
          context.report({
            node,
            messageId: 'inconsistentPackageJson',
            fix(fixer) {
              if (!fixedFiles.has(filename)) {
                fixedFiles.add(filename);
                fs.writeFileSync(packageJsonPath, normalizedJsonc, 'utf8');
              }
              return fixer.insertTextAfter(node, '');
            }
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
            messageId: 'inconsistentPackageJson',
            fix(fixer) {
              if (!fixedFiles.has(filename)) {
                fixedFiles.add(filename);
                fs.writeFileSync(packageJsonPath, normalizedJsonc, 'utf8');
              }
              return fixer.insertTextAfter(node, '');
            }
          });
        }
      }
    };
  }
};

// Export the rule as the default export
module.exports = rule;

// Export a function to clear the fixed files set (for testing)
module.exports.clearFixedFiles = function() {
  fixedFiles.clear();
};
