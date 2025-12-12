module.exports.config = {
    name: 'joinNoti',
    event_type: ['group_event'],
    version: '1.0.0',
    author: 'Integrated Bot',
    description: 'Thong bao khi co nguoi vao nhom'
};

module.exports.run = async ({ api, event, eventType }) => {
    if (event.type !== 1) return;

    const data = event.data;
    if (!data || data.updateType !== "group_join") return;

    const threadId = event.threadId;
    const memberIds = data.updateMembers || [];

    if (memberIds.length === 0) return;

    let msg = "Chao mung thanh vien moi:\n";
    memberIds.forEach((member, i) => {
        msg += `${i + 1}. ${member.dName || member.userId}\n`;
    });
    msg += "\nChuc ban vui ve trong nhom!";

    try {
        await api.sendMessage({ msg }, threadId, 1);
    } catch (e) {}
};
