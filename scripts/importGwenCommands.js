const fs = require('fs');
const path = require('path');

const src = '/tmp/GwenDev_ZaloChat/Core/Commands';
const dest = path.join(__dirname, '..', 'plugins', 'commands');
if (!fs.existsSync(src)) {
  console.error('Source not found:', src);
  process.exit(1);
}
if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

const files = fs.readdirSync(src).filter(f => f.endsWith('.js'));
for (const file of files) {
  const filePath = path.join(src, file);
  let content = fs.readFileSync(filePath, 'utf8');
  // replace import default
  content = content.replace(/import\s+([a-zA-Z0-9_{}*,\s]+)\s+from\s+['"](.*)['"];?/g, (m, imp, mod) => {
    // simple convert imports to require; named imports keep destructuring
    if (imp.startsWith('{') || imp.includes(',')) {
      return `const ${imp} = require('${mod}');`;
    }
    return `const ${imp} = require('${mod}');`;
  });
  // dynamic import to require
  content = content.replace(/await import\(['\"](.*)['\"]\)/g, (m, mod) => {
    return `require('${mod}')`;
  });
  // replace export default
  content = content.replace(/export\s+default\s+\{/g, 'module.exports = {');
  // replace export const/function
  content = content.replace(/export\s+(const|async function|function)\s+/g, (m, t) => {
    if (t === 'const') return 'const ';
    if (t === 'async function') return 'async function ';
    return 'function ';
  });

  // ensure require('zca-js') works
  content = content.replace(/from\s+['"]zca-js['"]/g, "from 'zca-js'");

  const outPath = path.join(dest, file);
  fs.writeFileSync(outPath, content, 'utf8');
  console.log('Imported', file);
}

console.log('Done');
