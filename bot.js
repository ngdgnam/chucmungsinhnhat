const fs = require("fs");
const path = require("path");
const YAML = require("yaml");
const login = require("./core/login");
const logger = require("./utils/logger");
const listener = require("./core/listen");
const loaderCommand = require("./core/loader/loaderCommand");
const loaderEvent = require("./core/loader/loaderEvent");
const schedule = require("node-schedule");
const { cleanOldMessages } = require("./utils/index");
const startDashboard = require("./dashboard/server");

global.client = {
    commands: new Map(),
    events: new Map(),
    cooldowns: new Map()
};

global.users = {
    admin: [],
    support: []
};

global.config = {};
global.api = null;
global.botStartTime = Date.now();

(async () => {
    try {
        const configPath = path.join(__dirname, "config.yml");
        const fileContent = fs.readFileSync(configPath, "utf8");
        const config = YAML.parse(fileContent);

        global.config = config;
        global.users = {
            admin: Array.isArray(config.admin_bot) ? config.admin_bot.map(String) : [],
            support: Array.isArray(config.support_bot) ? config.support_bot.map(String) : []
        };
        logger.log("Da tai cau hinh tu config.yml thanh cong", "info");
    } catch (error) {
        logger.log(`Loi khi doc config.yml: ${error.message || error}`, "error");
        process.exit(1);
    }

    const tempFolderCommand = path.join(__dirname, "plugins", "commands", "temp");
    const tempFolderEvent = path.join(__dirname, "plugins", "events", "temp");

    try {
        if (fs.existsSync(tempFolderCommand)) {
            fs.rmSync(tempFolderCommand, { recursive: true, force: true });
            logger.log("Da don dep folder temp cua commands", "info");
        }
        if (fs.existsSync(tempFolderEvent)) {
            fs.rmSync(tempFolderEvent, { recursive: true, force: true });
            logger.log("Da don dep folder temp cua events", "info");
        }
    } catch (error) {
        logger.log(`Loi khi don folder temp: ${error.message || error}`, "error");
    }

    logger.log("\n┏━━━━━━━━━━━━━━━━━━━━━━━━━━┓");
    for (let i = 0; i <= global.users.admin.length - 1; i++) {
        const dem = i + 1;
        logger.log(` ID ADMIN ${dem}: ${!global.users.admin[i] ? "Trong" : global.users.admin[i]}`);
    }
    for (let i = 0; i <= global.users.support.length - 1; i++) {
        const dem = i + 1;
        logger.log(` ID SUPPORT ${dem}: ${!global.users.support[i] ? "Trong" : global.users.support[i]}`);
    }
    logger.log(` NAME BOT: ${global.config.name_bot}`);
    logger.log(` PREFIX: ${global.config.prefix}`);
    logger.log("┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n");

    schedule.scheduleJob("0 * * * * *", () => {
        cleanOldMessages();
    });

    await loaderCommand();
    await loaderEvent();

    startDashboard(null);

    const api = await login();
    global.api = api;

    logger.log("Da dang nhap thanh cong", "info");

    listener(api);
})();
