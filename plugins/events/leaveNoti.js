module.exports.config = {
    name: 'leaveNoti',
    event_type: ['group_event'],
    version: '1.0.0',
    author: 'Integrated Bot',
    description: 'Thong bao khi co nguoi roi nhom'
};

const { createLeaveImage } = require('../../utils/imageTemplates');

module.exports.run = async ({ api, event, eventType }) => {
    if (event.type !== 1) return;

    const data = event.data;
    if (!data || data.updateType !== "group_leave") return;

    const threadId = event.threadId;
    const memberIds = data.updateMembers || [];

    if (memberIds.length === 0) return;

    let grpName = data.groupName || "Nhóm";
    try {
        const info = await api.getGroupInfo(threadId);
        const g = info?.gridInfoMap?.[String(threadId)];
        if (g?.name) grpName = g.name;
    } catch {}

    for (const member of memberIds) {
        const displayName = member.dName || member.userId || "Thành viên";
        let sent = false;
        try {
            const outPath = await createLeaveImage({ api, uid: member.userId, name: displayName, groupName: grpName });
            if (outPath) {
                await api.sendMessage({ msg: `Tạm biệt ${displayName}!`, attachments: [outPath] }, threadId, 1);
                sent = true;
                try { require('fs').unlinkSync(outPath); } catch (e) {}
            }
        } catch (e) {}

        if (!sent) {
            const msg = `Tạm biệt ${displayName}!`;
            try { await api.sendMessage({ msg }, threadId, 1); } catch (e) {}
        }
    }
};
