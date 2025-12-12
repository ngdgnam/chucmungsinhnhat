module.exports.config = {
    name: 'uptime',
    version: '1.0.0',
    role: 0,
    author: 'Integrated Bot',
    description: 'Xem thoi gian bot hoat dong',
    category: 'Tien ich',
    usage: 'uptime',
    cooldowns: 2
};

function formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    let result = [];
    if (days > 0) result.push(`${days} ngay`);
    if (hours > 0) result.push(`${hours} gio`);
    if (minutes > 0) result.push(`${minutes} phut`);
    if (secs > 0) result.push(`${secs} giay`);

    return result.join(" ") || "0 giay";
}

module.exports.run = async ({ args, event, api }) => {
    const { threadId, type } = event;
    const uptime = Date.now() - global.botStartTime;

    const msg = `Bot da hoat dong: ${formatUptime(uptime)}`;

    return api.sendMessage({ msg }, threadId, type);
};
