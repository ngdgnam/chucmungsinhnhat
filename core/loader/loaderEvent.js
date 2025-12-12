const fs = require("fs");
const path = require("path");
const logger = require("../../utils/logger");
const Users = require("../controller/controllerUsers");
const Threads = require("../controller/controllerThreads");

async function loadEvents(eventName = null) {
    const dir = path.join(__dirname, "../..", "plugins", "events");

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const files = eventName
        ? [`${eventName.replace(/\.js$/, '')}.js`]
        : fs.readdirSync(dir).filter(file => file.endsWith(".js"));

    let result = {};

    for (const file of files) {
        const filePath = path.join(dir, file);

        if (!fs.existsSync(filePath)) {
            logger.log(`Khong tim thay file: ${file}`, "error");
            result = { status: false, error: `Khong tim thay file: ${file}` };
            continue;
        }

        delete require.cache[require.resolve(filePath)];

        let event;
        try {
            event = require(filePath);
        } catch (err) {
            logger.log(`Khong the require file ${file}: ${err.message}`, "error");
            result = { status: false, error: `Khong the require file ${file}: ${err.message}` };
            continue;
        }

        if (!event.config || !event.config.name || !Array.isArray(event.config.event_type) || typeof event.run !== "function") {
            logger.log(`Event ${file} khong hop le`, "warn");
            result = { status: false, error: `Event ${file} khong hop le` };
            continue;
        }

        const name = event.config.name.toLowerCase();
        global.client.events.set(name, event);

        if (typeof event.onLoad === "function") {
            try {
                await event.onLoad({ api: global.api, Users, Threads });
            } catch (e) {
                logger.log(`Loi trong onLoad cua event ${name}: ${e.message}`, "error");
            }
        }
    }

    logger.log(
        eventName
            ? `Da tai lai event "${eventName}"`
            : `Da tai thanh cong ${global.client.events.size} su kien`,
        "info"
    );

    result = { status: true };
    return result;
}

module.exports = loadEvents;
