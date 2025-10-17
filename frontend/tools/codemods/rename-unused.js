#!/usr/bin/env node
// Codemod: rename assigned-but-unused variables to _-prefixed and remove unused imports where safe
// Uses ts-morph to analyze and modify TypeScript/JavaScript files under src/

const { Project, SyntaxKind } = require('ts-morph');
const path = require('path');

const project = new Project({
  tsConfigFilePath: path.join(__dirname, '../../tsconfig.json'),
  skipAddingFilesFromTsConfig: false,
});

const srcDir = path.join(__dirname, '../../src');

console.log('Scanning files in', srcDir);

const sourceFiles = project.getSourceFiles('src/**/*.{ts,tsx,js,jsx}');
let modifiedFiles = 0;

for (const file of sourceFiles) {
  let fileChanged = false;

  // Remove unused imports: find import declarations and check if named bindings are referenced
  const importDecls = file.getImportDeclarations();
  for (const imp of importDecls) {
    const namedImports = imp.getNamedImports();
    let removeDecl = true;

    for (const ni of namedImports) {
      const name = ni.getNameNode().getText();
      const refs = file.getDescendantsOfKind(SyntaxKind.Identifier).filter(id => id.getText() === name);
      // If more than 1 reference (the import itself counts), assume used somewhere
      if (refs.length > 1) {
        removeDecl = false;
        break;
      }
    }

    if (removeDecl) {
      // If the import has a default import or namespace import, avoid removing automatically
      if (!imp.getDefaultImport() && !imp.getNamespaceImport()) {
        imp.remove();
        fileChanged = true;
      }
    }
  }

  // Rename assigned but unused variables to _prefixed
  const variableStatements = file.getVariableStatements();
  for (const vs of variableStatements) {
    const decls = vs.getDeclarations();
    for (const d of decls) {
      const nameNode = d.getNameNode();
      const name = nameNode.getText();
      // Only consider simple identifier names
      if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name)) continue;

      const refs = nameNode.findReferences();
      // findReferences includes the declaration; if only 1 reference, it's unused
      if (refs.length === 1) {
        const newName = '_' + name;
        try {
          nameNode.rename(newName);
          fileChanged = true;
        } catch (e) {
          // rename may fail in some cases; skip
        }
      }
    }
  }

  if (fileChanged) {
    modifiedFiles += 1;
  }
}

if (modifiedFiles > 0) {
  project.save().then(() => {
    console.log('Codemod complete. Modified files:', modifiedFiles);
  }).catch(err => {
    console.error('Error saving project:', err);
  });
} else {
  console.log('No changes required by codemod.');
}
