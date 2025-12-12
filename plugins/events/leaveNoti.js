module.exports.config = {
    name: 'leaveNoti',
    event_type: ['group_event'],
    version: '1.0.0',
    author: 'Integrated Bot',
    description: 'Thong bao khi co nguoi roi nhom'
};

module.exports.run = async ({ api, event, eventType }) => {
    if (event.type !== 1) return;

    const data = event.data;
    if (!data || data.updateType !== "group_leave") return;

    const threadId = event.threadId;
    const memberIds = data.updateMembers || [];

    if (memberIds.length === 0) return;

    let msg = "Tam biet:\n";
    memberIds.forEach((member, i) => {
        msg += `${i + 1}. ${member.dName || member.userId}\n`;
    });

    try {
        await api.sendMessage({ msg }, threadId, 1);
    } catch (e) {}
};
