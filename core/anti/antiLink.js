const logger = require("../../utils/logger");
const Threads = require("../controller/controllerThreads");

const URL_REGEX = /(?:https?:\/\/|www\.|ftp\.)\S+|(?<!\w)[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?:\/[^\s]*)?(?!\w)/gi;

async function isAntiLinkEnabled(threadId) {
    if (!global.config.anti_link?.enabled) return false;

    const threadData = await Threads.getData(threadId);
    if (threadData?.data?.antiLink === false) return false;

    return true;
}

function isWhitelistedLink(href = "") {
    const whitelist = global.config.anti_link?.whitelist || ["zalo.me"];
    try {
        const url = new URL(href.startsWith("http") ? href : "https://" + href);
        const domain = url.hostname.replace(/^www\./, "");
        return whitelist.some(w => domain.includes(w));
    } catch (err) {
        return false;
    }
}

function extractUrls(text) {
    if (typeof text !== 'string') return [];
    return text.match(URL_REGEX) || [];
}

function startAntiLink(api) {
    api.listener.on("message", async (msg) => {
        const threadId = msg.threadId;
        const userId = msg.data?.uidFrom;
        const name = msg.senderName || "Nguoi dung";
        const type = msg.type;
        const data = msg.data;
        const msgBody = String(msg.data?.content || '');

        if (!userId || !data || type !== 1) return;

        const allow = await isAntiLinkEnabled(threadId);
        if (!allow) return;

        let containsUnwhitelistedLink = false;

        if (data.msgType === "chat.recommended" && data.content?.action === "recommened.link") {
            const link = data.content?.href;
            if (link && !isWhitelistedLink(link)) {
                containsUnwhitelistedLink = true;
            }
        }

        if (msgBody && !containsUnwhitelistedLink) {
            const urlsInBody = extractUrls(msgBody);
            for (const url of urlsInBody) {
                if (!isWhitelistedLink(url)) {
                    containsUnwhitelistedLink = true;
                    break;
                }
            }
        }

        if (containsUnwhitelistedLink) {
            try {
                if (data.cliMsgId && data.msgId) {
                    try {
                        await api.deleteMessage({
                            threadId,
                            type,
                            data: {
                                cliMsgId: data.cliMsgId,
                                msgId: data.msgId,
                                uidFrom: userId
                            }
                        }, false);
                    } catch (e) {}
                }

                const responseMsg = `@${name}, khong duoc gui link trong nhom nay!`;
                await api.sendMessage({
                    msg: responseMsg,
                    mentions: [{
                        uid: userId,
                        pos: responseMsg.indexOf(`@${name}`),
                        len: name.length + 1
                    }]
                }, threadId, type);
            } catch (err) {
                logger.log("Loi AntiLink: " + err.message, "error");
            }
        }
    });
}

module.exports = { startAntiLink };
