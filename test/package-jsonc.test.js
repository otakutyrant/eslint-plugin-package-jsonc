const fs = require('fs');
const path = require('path');
const os = require('os');
const { ESLint } = require('eslint');
const espree = require('espree');
const rule = require('../rules/package-jsonc');

// Create a temporary directory for testing
function createTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'eslint-test-'));
}

// Clean up temporary directory
function cleanupTempDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

// Clear fixed files tracking before each test
function clearFixedFiles() {
  if (rule.clearFixedFiles) {
    rule.clearFixedFiles();
  }
}

// JSON parser based on espree for ESLint
const jsonParser = {
  parseForESLint(code) {
    // Wrap JSON in a JavaScript expression so espree can parse it
    const wrappedCode = `(${code})`;
    const ast = espree.parse(wrappedCode, {
      ecmaVersion: 'latest',
      loc: true,
      range: true,
      tokens: true,
      comment: true
    });
    return {
      ast,
      services: {},
      visitorKeys: null,
      scopeManager: null
    };
  }
};

async function runTests() {
console.log('Running tests...\n');

// Test 1: Test parseJSONC function
console.log('Test 1: parseJSONC function');
{
  const testContent = `{
    "name": "test-package",
    // This is a comment
    "version": "1.0.0",
    /* Multi-line
       comment */
    "description": "A test package"
  }`;
  
  const parseJSONC = (content) => {
    let cleaned = content.replace(/\/\/.*$/gm, '');
    cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
    return JSON.parse(cleaned);
  };
  
  const result = parseJSONC(testContent);
  if (result.name === 'test-package' && result.version === '1.0.0' && result.description === 'A test package') {
    console.log('  ✓ parseJSONC correctly removes comments');
  } else {
    console.log('  ✗ parseJSONC failed to parse correctly');
    process.exit(1);
  }
  clearFixedFiles();
}

// Test 2: Test file generation on fix
console.log('\nTest 2: File generation when package.json is missing');
{
  const tempDir = createTempDir();
  const packageJsoncPath = path.join(tempDir, 'package.jsonc');
  const packageJsonPath = path.join(tempDir, 'package.json');
  
  const packageJsoncContent = `{
    "name": "test-package",
    // This is a comment
    "version": "1.0.0"
  }`;
  
  fs.writeFileSync(packageJsoncPath, packageJsoncContent, 'utf8');
  
  // Verify package.json doesn't exist
  if (fs.existsSync(packageJsonPath)) {
    console.log('  ✗ package.json should not exist initially');
    cleanupTempDir(tempDir);
    process.exit(1);
  }
  
  // Create ESLint instance with our plugin, using tempDir as cwd
  const eslint = new ESLint({
    cwd: tempDir,
    overrideConfigFile: true,
    overrideConfig: {
      files: ['**/*.jsonc'],
      plugins: {
        'package-jsonc': {
          rules: {
            'sync': rule
          }
        }
      },
      rules: {
        'package-jsonc/sync': 'error'
      },
      languageOptions: {
        parser: jsonParser
      }
    },
    fix: true
  });
  
  // Run ESLint on the package.jsonc file
  const results = await eslint.lintFiles(['package.jsonc']);
  
  // Check that package.json was created
  if (fs.existsSync(packageJsonPath)) {
    const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
    const packageJsonData = JSON.parse(packageJsonContent);
    
    if (packageJsonData.name === 'test-package' && packageJsonData.version === '1.0.0') {
      console.log('  ✓ package.json was created correctly');
    } else {
      console.log('  ✗ package.json content is incorrect');
      cleanupTempDir(tempDir);
      process.exit(1);
    }
  } else {
    console.log('  ✗ package.json was not created');
    cleanupTempDir(tempDir);
    process.exit(1);
  }
  
  cleanupTempDir(tempDir);
  clearFixedFiles();
}

// Test 3: Test file update when package.json is inconsistent
console.log('\nTest 3: File update when package.json is inconsistent');
{
  const tempDir = createTempDir();
  const packageJsoncPath = path.join(tempDir, 'package.jsonc');
  const packageJsonPath = path.join(tempDir, 'package.json');
  
  const packageJsoncContent = `{
    "name": "test-package",
    // Updated version
    "version": "2.0.0"
  }`;
  
  const oldPackageJsonContent = JSON.stringify({
    name: 'test-package',
    version: '1.0.0'
  }, null, 2) + '\n';
  
  fs.writeFileSync(packageJsoncPath, packageJsoncContent, 'utf8');
  fs.writeFileSync(packageJsonPath, oldPackageJsonContent, 'utf8');
  
  const eslint = new ESLint({
    cwd: tempDir,
    overrideConfigFile: true,
    overrideConfig: {
      files: ['**/*.jsonc'],
      plugins: {
        'package-jsonc': {
          rules: {
            'sync': rule
          }
        }
      },
      rules: {
        'package-jsonc/sync': 'error'
      },
      languageOptions: {
        parser: jsonParser
      }
    },
    fix: true
  });
  
  await eslint.lintFiles(['package.jsonc']);
  
  // Check that package.json was updated
  const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
  const packageJsonData = JSON.parse(packageJsonContent);
  
  if (packageJsonData.version === '2.0.0') {
    console.log('  ✓ package.json was updated correctly');
  } else {
    console.log('  ✗ package.json was not updated (version is still ' + packageJsonData.version + ')');
    cleanupTempDir(tempDir);
    process.exit(1);
  }
  
  cleanupTempDir(tempDir);
  clearFixedFiles();
}

// Test 4: Test no error when files are consistent
console.log('\nTest 4: No error when files are consistent');
{
  const tempDir = createTempDir();
  const packageJsoncPath = path.join(tempDir, 'package.jsonc');
  const packageJsonPath = path.join(tempDir, 'package.json');
  
  const packageJsoncContent = `{
    "name": "test-package",
    "version": "1.0.0"
  }`;
  
  // Generate what the expected package.json should be
  const parseJSONC = (content) => {
    let cleaned = content.replace(/\/\/.*$/gm, '');
    cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
    return JSON.parse(cleaned);
  };
  
  const expectedPackageJson = JSON.stringify(parseJSONC(packageJsoncContent), null, 2) + '\n';
  
  fs.writeFileSync(packageJsoncPath, packageJsoncContent, 'utf8');
  fs.writeFileSync(packageJsonPath, expectedPackageJson, 'utf8');
  
  const eslint = new ESLint({
    cwd: tempDir,
    overrideConfigFile: true,
    overrideConfig: {
      files: ['**/*.jsonc'],
      plugins: {
        'package-jsonc': {
          rules: {
            'sync': rule
          }
        }
      },
      rules: {
        'package-jsonc/sync': 'error'
      },
      languageOptions: {
        parser: jsonParser
      }
    },
    fix: false
  });
  
  const results = await eslint.lintFiles(['package.jsonc']);
  
  // Check that there are no errors
  const errorCount = results.reduce((sum, r) => sum + r.errorCount, 0);
  
  if (errorCount === 0) {
    console.log('  ✓ No error reported when files are consistent');
  } else {
    console.log('  ✗ Error reported when files are consistent:', results);
    cleanupTempDir(tempDir);
    process.exit(1);
  }
  
  cleanupTempDir(tempDir);
  clearFixedFiles();
}

console.log('\n✓ All tests passed!');
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
