const chalk = require('chalk');
const { DateTime } = require("luxon");

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
            break;
        case "error":
            console.log(chalk.bold.hex("#FF0000")(time + ' » ') + data);
            break;
        case "info":
            console.log(chalk.bold.hex("#00BFFF")(time + ' » ') + data);
            break;
        case "auto":
            console.log(chalk.bold.hex("#00FF00")(time + ' » ') + data);
            break;
        case "anti":
            console.log(chalk.bold.hex("#FF6600")(time + ' » ') + data);
            break;
        default:
            console.log(chalk.bold.hex("#00BFFF")(data));
    }
}

module.exports = {
    log,
    printBanner
};
