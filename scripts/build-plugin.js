#!/usr/bin/env node
// Assemble dist/plugin/{plugin.json,main.js,readme.md,icon.png} + dist/klax-math-plugin.zip
const fs = require('fs'), path = require('path'), cp = require('child_process');
const root = path.join(__dirname, '..'), out = path.join(root, 'dist', 'plugin');
fs.rmSync(path.join(root, 'dist'), { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
const core = fs.readFileSync(path.join(root, 'core/klax.js'), 'utf8');
const main = fs.readFileSync(path.join(root, 'plugin/main.src.js'), 'utf8');
// Le cœur est UMD : en contexte non-module il définit self.Klax.
fs.writeFileSync(path.join(out, 'main.js'), core + '\n;\n' + main);
for (const f of ['plugin.json', 'readme.md', 'icon.png']) fs.copyFileSync(path.join(root, 'plugin', f), path.join(out, f));
const zip = path.join(root, 'dist', 'klax-math-plugin.zip');
try { cp.execFileSync('zip', ['-j', '-q', zip, ...fs.readdirSync(out).map(f => path.join(out, f))]); }
catch (e) { cp.execFileSync('python3', ['-c', 'import sys,zipfile,os;z=zipfile.ZipFile(sys.argv[1],"w",zipfile.ZIP_DEFLATED);[z.write(os.path.join(sys.argv[2],f),f) for f in os.listdir(sys.argv[2])]', zip, out]); }
console.log('Plugin prêt :', zip);
