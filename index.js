const { spawn } = require("child_process");
const logger = require("./utils/logger");

(async () => {
    await logger.printBanner();

    const nodeVersion = process.versions.node.split('.')[0];
    if (parseInt(nodeVersion) < 18) {
        logger.log(`Phien ban Node.js ${process.version} khong ho tro. Vui long su dung Node.js 18 tro len.`, "error");
        return process.exit(1);
    }

    function startProject() {
        const child = spawn("node", ["bot.js"], {
            cwd: __dirname,
            stdio: "inherit",
            shell: true
        });

        child.on("close", (code) => {
            if (code === 2) {
                logger.log(`Khoi dong lai...`, "warn");
                startProject();
            }
        });
    }

    startProject();
})();
