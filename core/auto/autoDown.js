const axios = require("axios");
const logger = require("../../utils/logger");
const Threads = require("../controller/controllerThreads");

const SUPPORTED_LINKS = [
    /tiktok\.com/, /douyin\.com/, /instagram\.com/, /facebook\.com/,
    /youtube\.com/, /youtu\.be/, /twitter\.com/, /x\.com/,
    /threads\.com/, /threads\.net/, /pinterest\.com/, /reddit\.com/
];

async function isAutoDownEnabled(threadId) {
    if (!global.config.auto_down?.enabled) return false;

    const threadData = await Threads.getData(threadId);
    if (threadData?.data?.autoDown === false) return false;

    return true;
}

function startAutoDown(api) {
    api.listener.on("message", async (msg) => {
        const threadId = msg.threadId;
        const threadType = msg.type;

        const content = typeof msg.data?.content === "string" ? msg.data.content.trim() : "";
        const href = typeof msg.data?.content?.href === "string" ? msg.data.content.href.trim() : "";
        const title = typeof msg.data?.content?.title === "string" ? msg.data.content.title.trim() : "";
        const body = content || href || title;

        if (!body || !/^https?:\/\/\S+/.test(body)) return;
        if (!SUPPORTED_LINKS.some(rx => rx.test(body))) return;

        const allow = await isAutoDownEnabled(threadId);
        if (!allow) return;

        logger.log(`[AutoDown] URL: ${body}`, "auto");

        try {
            try {
                await api.addReaction(
                    "OK",
                    {
                        type: threadType,
                        threadId,
                        data: {
                            msgId: msg.data?.msgId,
                            cliMsgId: msg.data?.cliMsgId ?? 0,
                        },
                    }
                );
            } catch (e) {}

            const apiUrl = `https://api.zeidteam.xyz/media-downloader/atd2?url=${encodeURIComponent(body)}`;
            const res = await axios.get(apiUrl, { timeout: 30000 });
            const data = res.data;

            if (!data || !Array.isArray(data.medias) || data.medias.length === 0) {
                logger.log(`[AutoDown] Khong tim thay media`, "warn");
                return;
            }

            const mediaTitle = data.title?.trim() || "Downloaded Content";
            const author = data.author || data.unique_id || "Unknown";
            const source = data.source || "unknown";

            const video = data.medias.find(m => m.type === "video");
            const image = data.medias.find(m => m.type === "image");

            if (video?.url) {
                await api.sendVideo({
                    videoUrl: video.url,
                    thumbnailUrl: video.thumbnail || data.thumbnail || video.url,
                    msg: `AutoDown: ${source}\nTitle: ${mediaTitle}\nAuthor: ${author}`,
                    width: 720,
                    height: 1280,
                    duration: 10000,
                    ttl: 500000
                }, threadId, threadType);
            } else if (image?.url) {
                await api.sendMessage({
                    msg: `AutoDown: ${source}\nTitle: ${mediaTitle}\nAuthor: ${author}`,
                    attachments: [image.url]
                }, threadId, threadType);
            }
        } catch (err) {
            logger.log(`[AutoDown] Error: ${err.message}`, "error");
        }
    });
}

module.exports = { startAutoDown };
