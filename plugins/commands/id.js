module.exports.config = {
    name: 'id',
    version: '1.0.0',
    role: 0,
    author: 'Integrated Bot',
    description: 'Lay ID cua ban hoac nhom',
    category: 'Tien ich',
    usage: 'id',
    cooldowns: 2
};

module.exports.run = async ({ args, event, api }) => {
    const { threadId, type, data } = event;
    const userId = data.uidFrom;

    let msg = `User ID: ${userId}`;
    if (type === 1) {
        msg += `\nThread ID: ${threadId}`;
    }

    return api.sendMessage({ msg }, threadId, type);
};
