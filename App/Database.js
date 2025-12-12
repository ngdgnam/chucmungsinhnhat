const db = require('../utils/db');

/**
 * Minimal compatibility layer to emulate GwenDev SQL queries using our simple JSON DB.
 * This implements only the subset of queries used by Gwen: selecting groups (threads),
 * reading settings, and selecting users.
 */
async function query(sql, params = []) {
  const s = String(sql || '').toLowerCase();
  // SELECT thread_id FROM groups
  if (s.includes('from groups') && s.includes('select') && s.includes('thread_id')) {
    const threads = db.getAll('Threads') || {};
    return Object.keys(threads).map(k => ({ thread_id: k, name: threads[k].name }));
  }

  // SELECT uid FROM users WHERE thread_id = ?
  if (s.includes('from users') && s.includes('thread_id')) {
    const threadId = params && params[0];
    const users = db.getAll('Users') || {};
    const rows = [];
    for (const uid of Object.keys(users)) {
      const u = users[uid];
      if (String(u.thread_id) === String(threadId)) rows.push({ uid });
    }
    return rows;
  }

  // SELECT uid FROM users WHERE uid = ?
  if (s.includes('from users') && s.includes('where uid =')) {
    const uid = params && params[0];
    const users = db.getAll('Users') || {};
    if (users[uid]) return [{ uid }];
    return [];
  }

  // SELECT uid, name, admin FROM users WHERE admin > 0 ORDER BY admin DESC
  if (s.includes('from users') && s.includes('where admin')) {
    const users = db.getAll('Users') || {};
    const rows = Object.keys(users).map(uid => ({ uid, name: users[uid].name || '', admin: users[uid].admin || 0 }));
    const filtered = rows.filter(r => r.admin > 0);
    return filtered.sort((a,b) => (b.admin||0) - (a.admin||0));
  }

  // UPDATE users SET admin = ? WHERE uid = ?  (also for ban/unban)
  if (s.startsWith('update users set')) {
    const setMatch = s.match(/update users set\s+([a-z_]+)\s*=\s*(\d+)/);
    const uidParam = params && params[params.length - 1];
    if (setMatch) {
      const field = setMatch[1];
      const value = Number(setMatch[2]);
      const users = db.getAll('Users') || {};
      if (users[uidParam]) {
        users[uidParam][field] = value;
        db.saveData('Users', 'uid', uidParam, users[uidParam]);
        return [{ affected: 1 }];
      }
      return [{ affected: 0 }];
    }
    return [];
  }

  // SELECT status, thread FROM settings WHERE cmd = 'autosend'
  if (s.includes("from settings") && s.includes("autosend") && s.includes('select')) {
    const val = db.getSetting('autosend');
    if (!val) return [];
    // val expected: { status: 1, thread: JSON-string-of-threads }
    const status = val.status ?? 0;
    const thread = JSON.stringify(val.thread || []);
    return [{ status, thread }];
  }

  return [];
}

module.exports = { query };
