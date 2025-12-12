const logger = require("../../utils/logger");
const Threads = require("../controller/controllerThreads");

const spamCache = {};
const warned = {};

async function isAntiSpamEnabled(threadId) {
    if (!global.config.anti_spam?.enabled) return false;

    const threadData = await Threads.getData(threadId);
    if (threadData?.data?.antiSpam === false) return false;

    return true;
}

function startAntiSpam(api) {
    const SPAM_LIMITS = global.config.anti_spam || {
        warning1: 3,
        warning2: 5,
        kick_limit: 6,
        time_window: 2000
    };

    api.listener.on("message", async (msg) => {
        const threadId = msg.threadId;
        const userId = msg.data?.uidFrom;
        const name = msg.senderName || "Nguoi dung";
        const type = msg.type;

        if (!userId || type !== 1) return;

        const allow = await isAntiSpamEnabled(threadId);
        if (!allow) return;

        const now = Date.now();
        if (!spamCache[threadId]) spamCache[threadId] = {};
        if (!spamCache[threadId][userId]) spamCache[threadId][userId] = [];

        const userCache = spamCache[threadId][userId];
        userCache.push(now);
        spamCache[threadId][userId] = userCache.filter(ts => now - ts <= SPAM_LIMITS.time_window);

        const count = userCache.length;
        warned[threadId] = warned[threadId] || {};
        warned[threadId][userId] = warned[threadId][userId] || { w1: false, w2: false };

        try {
            if (count > SPAM_LIMITS.warning1) {
                if (msg.data?.cliMsgId && msg.data?.msgId) {
                    try {
                        await api.deleteMessage({
                            threadId,
                            type,
                            data: {
                                cliMsgId: msg.data.cliMsgId,
                                msgId: msg.data.msgId,
                                uidFrom: userId
                            }
                        }, false);
                    } catch (e) {}
                }
            }

            if (count > SPAM_LIMITS.warning1 && !warned[threadId][userId].w1) {
                warned[threadId][userId].w1 = true;
                const msgBody = `@${name}, dung spam nha!`;
                return await api.sendMessage({
                    msg: msgBody,
                    mentions: [{
                        uid: userId,
                        pos: msgBody.indexOf(`@${name}`),
                        len: name.length + 1
                    }]
                }, threadId, type);
            }

            if (count > SPAM_LIMITS.warning2 && !warned[threadId][userId].w2) {
                warned[threadId][userId].w2 = true;
                const msgBody = `@${name}, canh bao lan 2! Spam nua se bi kick!`;
                return await api.sendMessage({
                    msg: msgBody,
                    mentions: [{
                        uid: userId,
                        pos: msgBody.indexOf(`@${name}`),
                        len: name.length + 1
                    }]
                }, threadId, type);
            }

            if (count > SPAM_LIMITS.kick_limit) {
                try {
                    await api.removeUserFromGroup([userId], threadId);
                    const msgBody = `Da kick ${name} vi spam qua nhieu!`;
                    await api.sendMessage({ msg: msgBody }, threadId, type);
                } catch (err) {
                    logger.log("Khong the kick user: " + err.message, "error");
                }
                spamCache[threadId][userId] = [];
                warned[threadId][userId] = { w1: false, w2: false };
            }
        } catch (err) {
            logger.log("Loi AntiSpam: " + err.message, "error");
        }
    });
}

module.exports = { startAntiSpam };
