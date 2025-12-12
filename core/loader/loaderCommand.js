const fs = require("fs");
const path = require("path");
const logger = require("../../utils/logger");
const Users = require("../controller/controllerUsers");
const Threads = require("../controller/controllerThreads");

async function loadCommands(commandName = null) {
    const dir = path.join(__dirname, "../..", "plugins", "commands");

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const files = commandName
        ? [`${commandName.replace(/\.js$/, '')}.js`]
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

        let command;
        try {
            command = require(filePath);
        } catch (err) {
            logger.log(`Khong the require file ${file}: ${err.message}`, "error");
            result = { status: false, error: `Khong the require file ${file}: ${err.message}` };
            continue;
        }

        // Support both plugin formats: { config: {...}, run } and legacy { name, run }
        if (!command.config && command.name && typeof command.run === 'function') {
            command.config = {
                name: command.name,
                description: command.description || '',
                role: command.role || 0,
                group: command.group || 'general',
                aliases: command.aliases || [],
            };
        }

        if (!command.config || !command.config.name || typeof command.run !== "function") {
            logger.log(`Command ${file} khong hop le`, "warn");
            result = { status: false, error: `Command ${file} khong hop le` };
            continue;
        }

        const name = command.config.name.toLowerCase();
        global.client.commands.set(name, command);

        if (typeof command.onLoad === "function") {
            try {
                await command.onLoad({ api: global.api, Users, Threads });
            } catch (e) {
                logger.log(`Loi trong onLoad cua command ${name}: ${e.message}`, "error");
            }
        }
    }

    logger.log(
        commandName
            ? `Da tai lai command "${commandName}"`
            : `Da tai thanh cong ${global.client.commands.size} lenh`,
        "info"
    );

    result = { status: true };
    return result;
}

module.exports = loadCommands;
