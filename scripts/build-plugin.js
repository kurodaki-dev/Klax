#!/usr/bin/env node
// Builds dist/plugin/{plugin.json,main.js,readme.md,icon.png} and dist/klax-math-plugin.zip
//   KLAX_VERSION=1.0.7 node scripts/build-plugin.js   overrides the version written in plugin.json
const fs = require('fs'), path = require('path'), cp = require('child_process');
const root = path.join(__dirname, '..'), out = path.join(root, 'dist', 'plugin');
fs.rmSync(path.join(root, 'dist'), { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

const core = fs.readFileSync(path.join(root, 'core/klax.js'), 'utf8');
const main = fs.readFileSync(path.join(root, 'plugin/main.src.js'), 'utf8');
const exDir = path.join(root, 'examples'), examples = {};
for (const f of fs.readdirSync(exDir).filter(f => f.endsWith('.math')).sort()) examples[f] = fs.readFileSync(path.join(exDir, f), 'utf8');
const bundle = core + '\n;\nvar KLAX_EXAMPLES = ' + JSON.stringify(examples) + ';\n' + main;
fs.writeFileSync(path.join(out, 'main.js'), bundle);

const manifest = JSON.parse(fs.readFileSync(path.join(root, 'plugin/plugin.json'), 'utf8'));
if (process.env.KLAX_VERSION) manifest.version = process.env.KLAX_VERSION;
fs.writeFileSync(path.join(out, 'plugin.json'), JSON.stringify(manifest, null, 2) + '\n');
for (const f of ['readme.md', 'icon.png']) fs.copyFileSync(path.join(root, 'plugin', f), path.join(out, f));

const zip = path.join(root, 'dist', 'klax-math-plugin.zip');
try { cp.execFileSync('zip', ['-j', '-q', zip, ...fs.readdirSync(out).map(f => path.join(out, f))]); }
catch (e) { cp.execFileSync('python3', ['-c', 'import sys,zipfile,os;z=zipfile.ZipFile(sys.argv[1],"w",zipfile.ZIP_DEFLATED);[z.write(os.path.join(sys.argv[2],f),f) for f in os.listdir(sys.argv[2])]', zip, out]); }
console.log('Plugin ready (' + manifest.version + '):', zip);
