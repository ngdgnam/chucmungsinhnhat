const schedule = require('node-schedule');
const fs = require('fs');
const path = require('path');
const db = require('../../utils/db');
const { ThreadType } = require('zca-js');

const CONFIG_PATH = path.join(process.cwd(), 'data', 'AutoSend.json');
const ATTACH_DIR = path.join(process.cwd(), 'data', 'AutoSend');

function readAutoSendConfig() {
  try {
    if (!fs.existsSync(CONFIG_PATH)) return [];
    const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

function getEnabledAutoSendThreads() {
  const setting = db.getSetting('autosend');
  if (!setting) return [];
  if (!Array.isArray(setting)) return [];
  return setting;
}

function startAutoSend(api) {
  schedule.scheduleJob('* * * * *', async () => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const configs = readAutoSendConfig();
    const matching = configs.filter(cfg => cfg.time === currentTime);
    if (!matching.length) return;

    const threads = getEnabledAutoSendThreads();
    if (!threads.length) return;

    for (const cfg of matching) {
      const { content, attachments = [] } = cfg;

      const files = [];
      for (const name of attachments) {
        const filePath = path.join(ATTACH_DIR, name);
        if (fs.existsSync(filePath)) files.push(filePath);
      }

      for (const threadId of threads) {
        try {
          await api.sendMessage({ msg: content, attachments: files }, threadId, ThreadType.Group);
        } catch (err) {
          console.warn('[AutoSend] send error', err?.message || err);
        }
      }
    }
  });
}

module.exports = { startAutoSend };
