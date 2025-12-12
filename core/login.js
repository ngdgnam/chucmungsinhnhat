const fs = require("fs");
const path = require("path");
const { Zalo } = require("zca-js");
const logger = require("../utils/logger");
const { getJsonData, displayQRCodeInConsole } = require("../utils/index");

async function loginWithQR() {
    try {
        const zalo = new Zalo(global.config.zca_js_config);
        const accountPath = path.join(__dirname, `../${global.config.account_file}`);
        fs.mkdirSync(path.dirname(accountPath), { recursive: true });

        const accountData = getJsonData(accountPath);
        const cookieFileName = accountData.cookie || "cookie.json";
        const cookiePath = path.join(__dirname, `../${cookieFileName}`);

        const api = await zalo.loginQR({}, async (qrData) => {
            const { image, cookie, imei, userAgent, code } = qrData.data;

            if (image && !cookie) {
                logger.log("Vui long quet ma QRCode ben duoi de dang nhap:", "info");

                const qrPath = path.join(__dirname, `../${global.config.qrcode_path}`);
                await displayQRCodeInConsole(image, qrPath);
                return;
            }
            if (userAgent && cookie && imei) {
                if (!global.config.save_cookie) return;

                try {
                    fs.writeFileSync(cookiePath, JSON.stringify(cookie, null, 2), "utf8");

                    const newAccountData = {
                        imei,
                        userAgent,
                        cookie: cookieFileName
                    };
                    fs.writeFileSync(accountPath, JSON.stringify(newAccountData, null, 2), "utf8");
                    console.clear();
                    logger.log(`Da luu cookie vao ${cookieFileName} va cap nhat ${path.basename(accountPath)}`, "info");
                } catch (err) {
                    logger.log(`Loi khi ghi file: ${err.message || err}`, "error");
                    process.exit(1);
                }
            }
        });

        return api;
    } catch (error) {
        logger.log(`Loi dang nhap Zalo bang QR: ${error.message || error}`, "error");
        process.exit(1);
    }
}

async function loginWithCookie() {
    try {
        const zalo = new Zalo(global.config.zca_js_config);
        const accountPath = path.join(__dirname, `../${global.config.account_file}`);
        fs.mkdirSync(path.dirname(accountPath), { recursive: true });

        const accountData = getJsonData(accountPath);
        const cookie = getJsonData(accountData.cookie);

        const api = await zalo.login({
            cookie: cookie,
            imei: accountData.imei,
            userAgent: accountData.userAgent
        });

        return api;
    } catch (error) {
        logger.log(`Loi dang nhap Zalo bang Cookie: ${error.message || error}`, "error");
        throw new Error();
    }
}

async function login() {
    try {
        logger.log("Tien hanh login bang Cookie", "info");
        return await loginWithCookie();
    } catch (error) {
        if (!global.config.login_qrcode) {
            logger.log("Cookie khong hop le", "error");
            process.exit(1);
        }
        logger.log("Login bang Cookie that bai, chuyen sang QRCode...", "warn");
        return await loginWithQR();
    }
}

module.exports = login;
