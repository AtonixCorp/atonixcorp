#!/usr/bin/env node
// Codemod: remove redundant named icon imports when the same identifier is declared
// later in the same file (e.g. const DashboardIcon = ...). Uses ts-morph.

const { Project, SyntaxKind } = require('ts-morph');
const path = require('path');
const fs = require('fs');

const root = path.resolve(__dirname, '..', '..', 'src');
console.log('Scanning files in', root);

const project = new Project({ tsConfigFilePath: path.resolve(__dirname, '..', '..', 'tsconfig.json'), skipAddingFilesFromTsConfig: true });

function getSourceFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getSourceFiles(full));
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

const files = getSourceFiles(root);
let modified = 0;

for (const f of files) {
  const sf = project.addSourceFileAtPathIfExists(f) || project.createSourceFile(f, fs.readFileSync(f, 'utf8'));
  let changed = false;

  const importDecls = sf.getImportDeclarations();

  // collect top-level declared identifiers (const, let, var, function, class)
  const topLevelNames = new Set();
  sf.getStatements().forEach(stmt => {
    if (stmt.getKind() === SyntaxKind.VariableStatement) {
      stmt.getDeclarations().forEach(d => topLevelNames.add(d.getName()));
    } else if (stmt.getKind() === SyntaxKind.FunctionDeclaration || stmt.getKind() === SyntaxKind.ClassDeclaration) {
      const name = stmt.getFirstChildByKind(SyntaxKind.Identifier);
      if (name) topLevelNames.add(name.getText());
    }
  });

  for (const id of importDecls) {
    const moduleSpecifier = id.getModuleSpecifierValue();
    // restrict to suspected icon import sources we previously added
    if (!moduleSpecifier.includes('@mui/icons-material') && !moduleSpecifier.includes("@mui/icons-material/")) continue;

    const named = id.getNamedImports();
    for (const ni of named) {
      const name = ni.getName();
      if (topLevelNames.has(name)) {
        // remove this named import
        ni.remove();
        changed = true;
        console.log(`Removed redundant import ${name} from ${path.relative(root, f)}`);
      }
    }

    // if import has no named imports left, remove the declaration
    if (id.getNamedImports().length === 0 && !id.getDefaultImport()) {
      id.remove();
      changed = true;
    }
  }

  if (changed) {
    sf.fixUnusedIdentifiers();
    sf.saveSync();
    modified += 1;
  }
}

console.log(`Finished scanning. Files modified: ${modified}`);
