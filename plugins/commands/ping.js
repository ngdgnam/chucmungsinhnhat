module.exports.config = {
    name: 'ping',
    version: '1.0.0',
    role: 0,
    author: 'Integrated Bot',
    description: 'Kiem tra do tre cua bot',
    category: 'Tien ich',
    usage: 'ping',
    cooldowns: 2
};

module.exports.run = async ({ args, event, api }) => {
    const { threadId, type } = event;
    const start = Date.now();

    await api.sendMessage({ msg: "Pong!" }, threadId, type);

    const latency = Date.now() - start;
    return api.sendMessage({ msg: `Latency: ${latency}ms` }, threadId, type);
};
