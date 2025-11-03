#!/usr/bin/env node
// Codemod: prefix unused names in object destructuring with an underscore
// Example: const { user, organization } = useAuth(); -> const { _user, organization } = useAuth();
// Only renames when the name has no other references in the file.

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

  const varDecls = sf.getVariableDeclarations();
  for (const vd of varDecls) {
    const nameNode = vd.getNameNode();
    if (nameNode.getKind() === SyntaxKind.ObjectBindingPattern) {
      const elements = nameNode.getElements();
      for (const el of elements) {
        const identifier = el.getNameNode();
        if (identifier && identifier.getKind() === SyntaxKind.Identifier) {
          const name = identifier.getText();
          // find references
          const refs = sf.getDescendantsOfKind(SyntaxKind.Identifier).filter(id => id.getText() === name);
          // If only one reference (the declaration), safe to rename
          if (refs.length === 1) {
            // rename by replacing text in binding element
            identifier.replaceWithText(`_${name}`);
            changed = true;
            console.log(`Prefixed unused destructured name _${name} in ${path.relative(root, f)}`);
          }
        }
      }
    }
  }

  if (changed) {
    sf.fixUnusedIdentifiers();
    sf.saveSync();
    modified += 1;
  }
}

console.log(`Finished scanning. Files modified: ${modified}`);
