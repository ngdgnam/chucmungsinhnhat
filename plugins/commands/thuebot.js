// author @GwenDev - modified to remove paid/rental logic; make free
const db = require('../../utils/db.js');
const { query } = require('../../App/Database.js');

module.exports = {
  name: "thuebot",
  description: "lượt dùng bot",
  cooldown: 5,
  group: "system",
  role: 0,

  async run({ message, api, args }) {
    const threadId = message.threadId;
    const uid = message.data?.uidFrom;
    const name = message.data?.senderName || "Không rõ";
    const type = message.type;
    const now = new Date();

    // Simplified: remove paid/rental logic. Add free/paid toggles for group admins.
    const subcmd = args[0]?.toLowerCase();

    if (subcmd === 'status') {
      const threads = db.getAll('Threads') || {};
      const thread = threads[threadId] || {};
      const free = thread.free ? true : false;
      return api.sendMessage(`📊 Trạng Thái Nhóm\n• Miễn phí: ${free ? 'Đã bật (Sử dụng không giới hạn)' : 'Tắt (Thuê/Trả phí)'}`, threadId, type);
    }

    if (!subcmd) {
      return api.sendMessage(
        `⚙️ 𝐋ệnh Thuebot (đã chuyển sang chế độ miễn phí mặc định)
Usage:
.thuebot status — kiểm tra trạng thái nhóm
.thuebot free — bật chế độ miễn phí (không giới hạn)
.thuebot paid — tắt chế độ miễn phí`,
        threadId,
        type
      );
    }

    if (subcmd === 'free' || subcmd === 'enable') {
      const threads = db.getAll('Threads') || {};
      const cur = threads[threadId] || { name };
      cur.free = true;
      db.saveData('Threads', 'thread_id', threadId, cur);
      return api.sendMessage('✔️ Chế độ miễn phí đã được bật cho nhóm này. Các lệnh miễn phí và không còn yêu cầu thuê.', threadId, type);
    }

    if (subcmd === 'paid' || subcmd === 'disable') {
      const threads = db.getAll('Threads') || {};
      const cur = threads[threadId] || { name };
      cur.free = false;
      db.saveData('Threads', 'thread_id', threadId, cur);
      return api.sendMessage('🔒 Chế độ miễn phí đã được tắt cho nhóm này.', threadId, type);
    }

    return api.sendMessage('Lệnh không hợp lệ. Sử dụng .thuebot để xem hướng dẫn.', threadId, type);
  },
};
