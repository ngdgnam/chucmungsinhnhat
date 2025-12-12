const Threads = require("../../core/controller/controllerThreads");

module.exports.config = {
    name: 'setprefix',
    version: '1.0.0',
    role: 1,
    author: 'Integrated Bot',
    description: 'Thay doi prefix cho nhom',
    category: 'Quan ly',
    usage: 'setprefix <prefix_moi>',
    cooldowns: 2
};

module.exports.run = async ({ args, event, api, Threads }) => {
    const { threadId, type } = event;

    if (args.length < 1) {
        return api.sendMessage({
            msg: "Su dung: /setprefix <prefix_moi>"
        }, threadId, type);
    }

    const newPrefix = args[0];

    if (newPrefix.length > 5) {
        return api.sendMessage({
            msg: "Prefix khong duoc qua 5 ky tu!"
        }, threadId, type);
    }

    const threadData = await Threads.getData(threadId);
    const data = threadData?.data || {};
    data.prefix = newPrefix;

    Threads.setData(threadId, data);

    return api.sendMessage({
        msg: `Da thay doi prefix thanh: ${newPrefix}`
    }, threadId, type);
};
