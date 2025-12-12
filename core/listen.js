const handleCommand = require("./handle/handleCommand");
const handleEvent = require("./handle/handleEvent");
const { startAntiSpam } = require("./anti/antiSpam");
const { startAntiLink } = require("./anti/antiLink");
const { startAutoDown } = require("./auto/autoDown");
const { startAutoSend } = require("./auto/autoSend");
const logger = require("../utils/logger");
const { updateMessageCache } = require("../utils/index");
const { dispatchPendingReply } = require('./handle/handleReply');
const Threads = require("./controller/controllerThreads");

function startListening(api) {
    if (!api?.listener?.on || !api.listener.start) {
        logger.log("API listener khong hop le.", "error");
        return;
    }

    api.listener.on("message", async (event) => {
        updateMessageCache(event);
        let threadData;

        threadData = await Threads.getData(event.threadId);

        const threadInfo = threadData?.data || {};
        const prefix = threadInfo.prefix ? threadInfo.prefix : global.config.prefix;

        const handled = await dispatchPendingReply(event, api);
        if (handled) return;
        handleEvent("message", event, api);

        const { data } = event;
        const content = data?.content?.title ?? data?.content;

        if (typeof content === "string" && content.startsWith(prefix)) {
            handleCommand(content, event, api, threadInfo, prefix);
        }
    });

    api.listener.on("group_event", (event) => {
        handleEvent("group_event", event, api);
    });

    api.listener.on("reaction", (event) => {
        handleEvent("reaction", event, api);
    });

    api.listener.on("undo", (event) => {
        handleEvent("undo", event, api);
    });

    startAntiSpam(api);
    startAntiLink(api);
    startAutoDown(api);
    startAutoSend(api);

    logger.log("[ANTI] AntiSpam da duoc kich hoat", "anti");
    logger.log("[ANTI] AntiLink da duoc kich hoat", "anti");
    logger.log("[AUTO] AutoDown da duoc kich hoat", "auto");
    logger.log("[AUTO] AutoSend da duoc kich hoat", "auto");

    api.listener.start();
    logger.log("Da bat dau lang nghe su kien", "info");
}

module.exports = startListening;
