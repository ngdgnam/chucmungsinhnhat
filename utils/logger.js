const chalk = require('chalk');
const { DateTime } = require("luxon");
const fs = require('fs');
const path = require('path');

async function printBanner() {
    console.clear();
    console.log(
        chalk.cyanBright(`
███████╗ █████╗ ██╗      ██████╗     ██████╗  ██████╗ ████████╗
╚══███╔╝██╔══██╗██║     ██╔═══██╗    ██╔══██╗██╔═══██╗╚══██╔══╝
  ███╔╝ ███████║██║     ██║   ██║    ██████╔╝██║   ██║   ██║   
 ███╔╝  ██╔══██║██║     ██║   ██║    ██╔══██╗██║   ██║   ██║   
███████╗██║  ██║███████╗╚██████╔╝    ██████╔╝╚██████╔╝   ██║   
╚══════╝╚═╝  ╚═╝╚══════╝ ╚═════╝     ╚═════╝  ╚═════╝    ╚═╝                                       
`)
    );

    console.log(chalk.gray("═══════════════════════════════════════════════════════════════════"));
    console.log("» " + chalk.green("Version: ") + chalk.white("1.0.0"));
    console.log("» " + chalk.green("Source : ") + chalk.white("Zeid_Bot + GwenDev_ZaloChat"));
    console.log("» " + chalk.green("Feature: ") + chalk.white("QR Login, Commands, Events, Auto/Anti"));
    console.log(chalk.gray("═══════════════════════════════════════════════════════════════════\n"));
}

function getTimestamp() {
    const now = DateTime.now().setZone('Asia/Ho_Chi_Minh');
    return `[${now.toFormat("HH:mm:ss")}]`;
}

function log(data, option) {
    const time = getTimestamp();
    switch (option) {
        case "warn":
            console.log(chalk.bold.hex("#FFD700")(time + ' » ') + data);
            writeLogToFile('warn', data);
            break;
        case "error":
            console.log(chalk.bold.hex("#FF0000")(time + ' » ') + data);
            writeLogToFile('error', data);
            break;
        case "info":
            console.log(chalk.bold.hex("#00BFFF")(time + ' » ') + data);
            writeLogToFile('info', data);
            break;
        case "auto":
            console.log(chalk.bold.hex("#00FF00")(time + ' » ') + data);
            writeLogToFile('auto', data);
            break;
        case "anti":
            console.log(chalk.bold.hex("#FF6600")(time + ' » ') + data);
            writeLogToFile('anti', data);
            break;
        default:
            console.log(chalk.bold.hex("#00BFFF")(data));
            writeLogToFile('info', data);
    }
}

function ensureLogFile() {
    const logPath = path.join(__dirname, '..', 'logs');
    try {
        if (!fs.existsSync(logPath)) fs.mkdirSync(logPath, { recursive: true });
    } catch (e) {}
}

function writeLogToFile(level, message) {
    try {
        ensureLogFile();
        const file = path.join(__dirname, '..', 'logs', 'app.log');
        const ts = getTimestamp();
        const line = `${ts} ${level.toUpperCase()} » ${message}\n`;
        fs.appendFileSync(file, line, 'utf8');
    } catch (err) {
        // if writing fails, ignore — this should not crash the bot
    }
}

function getRecentLogs(limit = 200) {
    try {
        const file = path.join(__dirname, '..', 'logs', 'app.log');
        if (!fs.existsSync(file)) return [];
        const data = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean);
        if (data.length <= limit) return data;
        return data.slice(-limit);
    } catch (e) {
        return [];
    }
}

module.exports = {
    log,
    printBanner
    ,getRecentLogs
};
