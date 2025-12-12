const logger = require("../../utils/logger");
const Users = require("../controller/controllerUsers");
const Threads = require("../controller/controllerThreads");
const { ThreadType } = require("zca-js");

async function handleCommand(messageText, event = null, api = null, threadInfo = null, prefix = null) {
    const config = global.config;

    if (!messageText || typeof messageText !== "string") return;

    const threadId = event?.threadId;
    const type = event?.type;
    const UIDUsage = event?.data?.uidFrom;

    if (type == ThreadType.User && config.allow_private_command === false) {
        return;
    }

    const args = messageText.slice(prefix.length).trim().split(/\s+/);
    const commandName = args.shift().toLowerCase();

    let command = global.client.commands.get(commandName);
    if (!command) {
        for (const [, cmd] of global.client.commands) {
            if (Array.isArray(cmd.config.aliases) && cmd.config.aliases.includes(commandName)) {
                command = cmd;
                break;
            }
        }
    }

    if (!command) {
        if (api && threadId && type) {
            api.sendMessage({
                msg: "Lenh khong ton tai!",
                ttl: 20000
            }, threadId, type);
        }
        return;
    }

    const role = command.config.role || 0;
    const isBotAdmin = global.users?.admin?.includes(UIDUsage);
    const isSupport = global.users?.support?.includes(UIDUsage);

    let isGroupAdmin = false;

    if (type == 1) {
        if (threadInfo.box_only) {
            try {
                const info = await api.getGroupInfo(threadId);
                const groupInfo = info.gridInfoMap[threadId];

                const isCreator = groupInfo.creatorId == UIDUsage;
                const isDeputy = Array.isArray(groupInfo.adminIds) && groupInfo.adminIds.includes(UIDUsage);

                isGroupAdmin = isCreator || isDeputy;
            } catch (err) {
                logger.log("Khong the lay thong tin nhom tu API: " + err.message, "warn");
            }
        }

        if (threadInfo.admin_only && !isBotAdmin) {
            return api.sendMessage({
                msg: "Nhom da bat che do chi admin bot dung duoc lenh.",
                ttl: 30000
            }, threadId, type);
        }

        if (threadInfo.support_only && !isSupport && !isBotAdmin) {
            return api.sendMessage({
                msg: "Nhom da bat che do chi support bot hoac admin bot dung duoc lenh.",
                ttl: 30000
            }, threadId, type);
        }

        if (threadInfo.box_only && !isGroupAdmin && !isBotAdmin) {
            return api.sendMessage({
                msg: "Nhom da bat che do chi truong nhom hoac pho nhom dung duoc lenh.",
                ttl: 30000
            }, threadId, type);
        }
    }

    if ((role === 2 && !isBotAdmin) || (role === 1 && !isBotAdmin && !isSupport)) {
        return api.sendMessage({
            msg: "Ban khong co quyen su dung lenh nay.",
            ttl: 30000
        }, threadId, type);
    }

    const cdTime = (command.config.cooldowns || 0) * 1000;

    if (!global.client.cooldowns.has(commandName)) {
        global.client.cooldowns.set(commandName, new Map());
    }

    const cdMap = global.client.cooldowns.get(commandName);
    const lastUsed = cdMap.get(UIDUsage);

    if (lastUsed && Date.now() - lastUsed < cdTime) {
        const timeLeft = ((cdTime - (Date.now() - lastUsed)) / 1000).toFixed(1);
        return api.sendMessage({
            msg: `Vui long cho ${timeLeft}s de dung lai lenh '${commandName}'`,
            ttl: 15000
        }, threadId, type);
    }

    cdMap.set(UIDUsage, Date.now());

    try {
        const replyData = {
            content: event.data.content,
            msgType: event.data.msgType,
            propertyExt: event.data.propertyExt,
            uidFrom: event.data.uidFrom,
            msgId: event.data.msgId,
            cliMsgId: event.data.cliMsgId,
            ts: event.data.ts,
            ttl: event.data.ttl
        };
        command.run({ args, event, api, Users, Threads, replyData });
    } catch (err) {
        logger.log("Loi khi xu ly lenh: " + err.message, "error");
        return api.sendMessage({
            msg: "Da xay ra loi khi xu ly lenh!",
            ttl: 30000
        }, threadId, type);
    }
}

module.exports = handleCommand;
