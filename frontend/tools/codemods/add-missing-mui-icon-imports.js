#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const src = path.join(root, 'src');

function walk(dir) {
  const files = [];
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) files.push(...walk(p));
    else if (/\.(tsx|ts|jsx|js)$/.test(name)) files.push(p);
  }
  return files;
}

function fileHasImport(content, iconName, base) {
  const importRegex1 = new RegExp(`import\\s+${iconName}\\s+from\\s+['\"]@mui/icons-material/${base}['\"]`);
  const importRegex2 = new RegExp(`from\\s+['\"]@mui/icons-material/${base}['\"]`);
  return importRegex1.test(content) || importRegex2.test(content);
}

function tryResolveModule(base) {
  try {
    // try resolving the package subpath
    require.resolve(`@mui/icons-material/${base}`, { paths: [root] });
    return true;
  } catch (e) {
    return false;
  }
}

let modified = 0;
const files = walk(src);
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  // find JSX tag identifiers that look like Icon names
  const jsxIconRegex = /<([A-Z][A-Za-z0-9_]*)\b/g;
  const icons = new Set();
  let m;
  while ((m = jsxIconRegex.exec(content))) {
    const name = m[1];
    if (name.endsWith('Icon')) icons.add(name);
  }
  if (icons.size === 0) continue;

  const importsToAdd = [];
  for (const iconName of icons) {
    const base = iconName.replace(/Icon$/, '');
    if (fileHasImport(content, iconName, base)) continue;
    if (tryResolveModule(base)) {
      importsToAdd.push({ iconName, base });
    }
  }
  if (importsToAdd.length === 0) continue;

  // Insert imports after the last existing import or at top
  const lines = content.split('\n');
  let insertAt = 0;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*import\s+/.test(lines[i])) insertAt = i + 1;
  }

  const importLines = importsToAdd.map(({ iconName, base }) => `import ${iconName} from '@mui/icons-material/${base}';`);
  lines.splice(insertAt, 0, ...importLines);
  fs.writeFileSync(file, lines.join('\n'));
  modified++;
  console.log(`Added imports to ${path.relative(root, file)}: ${importsToAdd.map(i => i.iconName).join(', ')}`);
}

console.log(`Finished scanning. Files modified: ${modified}`);
