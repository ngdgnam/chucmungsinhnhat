const { updateConfigArray, reloadConfig } = require('../../utils/index');
const logger = require('../../utils/logger');

module.exports.config = {
    name: 'admin',
    version: '1.0.0',
    role: 2,
    author: 'Integrated Bot',
    description: 'Quan ly danh sach admin bot',
    category: 'Admin',
    usage: 'admin add|rm|list @tag',
    cooldowns: 3
};

module.exports.run = async ({ args, event, api }) => {
    const { threadId, type } = event;
    const sub = args[0] ? args[0].toLowerCase() : '';
    const mentions = event.data?.mentions || [];

    if (!sub) return api.sendMessage({ msg: 'Cach su dung: admin add|rm|list @tag' }, threadId, type);

    try {
        if (sub === 'list') {
            const admins = Array.isArray(global.config.admin_bot) ? global.config.admin_bot : [];
            const text = admins.length ? `Danh sach admin:\n${admins.map((a, i) => `${i + 1}. ${a}`).join('\n')}` : 'Chua co admin nao.';
            return api.sendMessage({ msg: text }, threadId, type);
        }

        if (sub === 'add' || sub === 'rm') {
            if (!Array.isArray(mentions) || mentions.length === 0) return api.sendMessage({ msg: 'Vui long tag nguoi can them/bo admin.' }, threadId, type);

            const current = Array.isArray(global.config.admin_bot) ? global.config.admin_bot.map(String) : [];
            let updated = [...current];

            for (const m of mentions) {
                const uid = String(m.uid || m);
                if (sub === 'add' && !updated.includes(uid)) updated.push(uid);
                if (sub === 'rm') updated = updated.filter(x => x !== uid);
            }

            updateConfigArray('admin_bot', updated);
            reloadConfig();
            return api.sendMessage({ msg: `${sub === 'add' ? 'Da them' : 'Da bo'} ${mentions.length} nguoi vao danh sach admin.` }, threadId, type);
        }

        return api.sendMessage({ msg: 'Cach su dung: admin add|rm|list @tag' }, threadId, type);
    } catch (e) {
        logger.log('Loi lenh admin: ' + (e.message || e), 'error');
        return api.sendMessage({ msg: 'Da xay ra loi khi thuc hien lenh admin.' }, threadId, type);
    }
};
