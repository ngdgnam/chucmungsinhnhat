module.exports.config = {
    name: 'joinNoti',
    event_type: ['group_event'],
    version: '1.0.0',
    author: 'Integrated Bot',
    description: 'Thong bao khi co nguoi vao nhom'
};

const { createWelcomeImage } = require('../../utils/imageTemplates');

module.exports.run = async ({ api, event, eventType }) => {
    if (event.type !== 1) return;

    const data = event.data;
    if (!data || data.updateType !== "group_join") return;

    const threadId = event.threadId;
    const memberIds = data.updateMembers || [];

    if (memberIds.length === 0) return;

    // obtain group name if not provided
    let grpName = data.groupName || "Nhóm";
    try {
        const info = await api.getGroupInfo(threadId);
        const g = info?.gridInfoMap?.[String(threadId)];
        if (g?.name) grpName = g.name;
    } catch {}

    for (const member of memberIds) {
        const displayName = member.dName || member.userId || "Thành viên mới";
        let sent = false;
        try {
            const outPath = await createWelcomeImage({ api, uid: member.userId, name: displayName, groupName: grpName });
            if (outPath) {
                const mentionText = `Chào mừng @${displayName} đến nhóm!`;
                await api.sendMessage({ msg: mentionText, attachments: [outPath], mentions: [{ pos: 11, len: displayName.length + 1, uid: member.userId }] }, threadId, 1);
                sent = true;
                // try remove file
                try { require('fs').unlinkSync(outPath); } catch (e) {}
            }
        } catch (err) {}

        if (!sent) {
            const msg = `Chào mừng ${displayName} đến nhóm!`;
            try { await api.sendMessage({ msg, mentions: [{ pos: 11, len: displayName.length + 1, uid: member.userId }] }, threadId, 1); } catch (e) {}
        }
    }
};
