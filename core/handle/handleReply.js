const logger = require('../../utils/logger');

const pending = new Map(); // key: cliMsgId or msgId -> array of registrations

function _makeKey(msgId, cliMsgId) {
  if (cliMsgId) return `cli:${cliMsgId}`;
  if (msgId) return `msg:${msgId}`;
  return null;
}

function dangKyReply({ msgId, cliMsgId, threadId, authorId, command, ttlMs = 5 * 60 * 1000, data, onReply }) {
  const key = _makeKey(msgId, cliMsgId);
  if (!key) return;
  const expires = Date.now() + ttlMs;
  const arr = pending.get(key) || [];
  arr.push({ threadId, authorId, command, expires, data, onReply });
  pending.set(key, arr);
}

function clearPendingReply({ msgId, cliMsgId }) {
  const key = _makeKey(msgId, cliMsgId);
  if (!key) return;
  pending.delete(key);
}

async function dispatchPendingReply(message, api) {
  try {
    const q = message.data?.quote;
    const replyKey = q?.cliMsgId ? `cli:${q.cliMsgId}` : (q?.msgId ? `msg:${q.msgId}` : null);
    if (!replyKey) return false;
    const list = pending.get(replyKey) || [];
    if (!list.length) return false;

    const now = Date.now();
    const idx = list.findIndex(r => r.expires >= now && (!r.authorId || String(r.authorId) === String(message.data?.uidFrom || message.senderId || message.data?.uid)));
    if (idx === -1) return false;

    const item = list[idx];
    // call onReply
    try {
      const res = await item.onReply({ message, api, content: (message.data?.content || message.body || ''), data: item.data });
      return !!res;
    } catch (err) {
      logger.log(`[reply] handler error: ${err.message || err}`, 'error');
      return false;
    }
  } catch (err) {
    return false;
  }
}

module.exports = { dangKyReply, clearPendingReply, dispatchPendingReply };
