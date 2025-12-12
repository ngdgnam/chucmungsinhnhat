const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const os = require('os');
const logger = require('../../utils/logger');
const { displayQRCodeInConsole } = require('../../utils/index');

module.exports.config = {
    name: 'logqr',
    version: '1.0.0',
    role: 1,
    author: 'Integrated Bot',
    description: 'Tao ma QR de truy cap log tren dashboard',
    category: 'Tien ich',
    usage: 'logqr [limit]',
    cooldowns: 5
};

function getLocalIp() {
    const nets = os.networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return '127.0.0.1';
}

module.exports.run = async ({ args, event, api }) => {
    const { threadId, type } = event;
    const limit = parseInt(args[0]) || 200;

    const port = global.config.dashboard_port || 5000;
    const host = global.config.dashboard_host || getLocalIp();
    const url = `http://${host}:${port}/logs?limit=${limit}`;

    try {
        const dataUrl = await QRCode.toDataURL(url, { errorCorrectionLevel: 'M', margin: 1 });
        // Save as file
        const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
        const filePath = path.join(__dirname, '..', 'temp', `logs-${Date.now()}.png`);
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, Buffer.from(base64, 'base64'));

        // Try to send as attachment
        await api.sendMessage({ msg: `Quet QR de xem log (limit: ${limit})`, attachments: filePath }, threadId, type);

        // Display in terminal as well
        try { await displayQRCodeInConsole(base64, filePath); } catch (e) {}

        // Do not delete the file immediately, but cleanup later
    } catch (err) {
        logger.log('Loi khi tao QR log: ' + (err.message || err), 'error');
        return api.sendMessage({ msg: 'Loi khi tao QR code de xem log.' }, threadId, type);
    }
};
