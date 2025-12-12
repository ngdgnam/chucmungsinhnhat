module.exports.config = {
    name: 'anti',
    version: '1.0.0',
    role: 1,
    author: 'Integrated Bot',
    description: 'Bat/tat tinh nang anti (spam, link)',
    category: 'Quan ly',
    usage: 'anti <spam|link> <on|off>',
    cooldowns: 2
};

module.exports.run = async ({ args, event, api, Threads }) => {
    const { threadId, type } = event;

    if (args.length < 2) {
        return api.sendMessage({
            msg: "Su dung: /anti <spam|link> <on|off>"
        }, threadId, type);
    }

    const feature = args[0].toLowerCase();
    const action = args[1].toLowerCase();

    if (!["spam", "link"].includes(feature)) {
        return api.sendMessage({
            msg: "Tinh nang khong hop le! Chi ho tro: spam, link"
        }, threadId, type);
    }

    if (!["on", "off"].includes(action)) {
        return api.sendMessage({
            msg: "Hanh dong khong hop le! Chi ho tro: on, off"
        }, threadId, type);
    }

    const threadData = await Threads.getData(threadId);
    const data = threadData?.data || {};

    if (feature === "spam") {
        data.antiSpam = action === "on";
    } else if (feature === "link") {
        data.antiLink = action === "on";
    }

    Threads.setData(threadId, data);

    const status = action === "on" ? "bat" : "tat";
    return api.sendMessage({
        msg: `Da ${status} Anti${feature.charAt(0).toUpperCase() + feature.slice(1)} cho nhom nay!`
    }, threadId, type);
};
