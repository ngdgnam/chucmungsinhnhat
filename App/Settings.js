const path = require('path');
const fs = require('fs');
const YAML = require('yaml');

const CONFIG_PATH = path.join(process.cwd(), 'config.yml');

let settings = {};
try {
  if (fs.existsSync(CONFIG_PATH)) {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
    const cfg = YAML.parse(raw);
    settings.apis = cfg.apis || {};
  }
} catch (e) {
  settings = { apis: {} };
}

module.exports = { settings };
