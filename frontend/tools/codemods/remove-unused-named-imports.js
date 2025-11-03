#!/usr/bin/env node
// Codemod: remove unused named imports from files under src/
// It removes individual named imports if they are not referenced in the file.
// Uses ts-morph for safe AST manipulations.

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
  const importDecls = file.getImportDeclarations();

  for (const imp of importDecls) {
    const namedImports = imp.getNamedImports();
    for (const ni of namedImports) {
      const name = ni.getNameNode().getText();
      // find identifiers matching this name in the file
      const ids = file.getDescendantsOfKind(SyntaxKind.Identifier).filter(id => id.getText() === name);
      // keep if more than 1 occurrence (declaration + use)
      if (ids.length <= 1) {
        // remove this named import
        try {
          ni.remove();
          fileChanged = true;
        } catch (e) {
          // ignore failures
        }
      }
    }

    // if the import now has no specifiers (no named, no default, no namespace), remove it
    const hasDefault = !!imp.getDefaultImport();
    const hasNamed = imp.getNamedImports().length > 0;
    const hasNamespace = !!imp.getNamespaceImport();
    if (!hasDefault && !hasNamed && !hasNamespace) {
      try {
        imp.remove();
        fileChanged = true;
      } catch (e) {}
    }
  }

  if (fileChanged) modifiedFiles++;
}

if (modifiedFiles > 0) {
  project.save().then(() => console.log('Removed unused named imports in files:', modifiedFiles)).catch(err => console.error(err));
} else {
  console.log('No unused named imports found to remove.');
}
