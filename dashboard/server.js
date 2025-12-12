const express = require("express");
const http = require("http");
const path = require("path");
const fs = require("fs");
const { Server } = require("socket.io");
const logger = require("../utils/logger");

let botStartTime = Date.now();
let botApi = null;
let io = null;

function startDashboard(api) {
    botApi = api;

    const app = express();
    const server = http.createServer(app);

    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static(path.join(__dirname, 'public')));

    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));

    function getCommandsFromFiles() {
        const commands = [];
        for (const [name, cmd] of global.client.commands) {
            commands.push({
                name: cmd.config.name,
                description: cmd.config.description || 'Khong co mo ta',
                role: cmd.config.role || 0,
                cooldown: cmd.config.cooldowns || 0,
                category: cmd.config.category || 'Khac'
            });
        }
        return commands;
    }

    function formatUptime(seconds) {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (days > 0) {
            return `${days}d ${hours}h ${minutes}m`;
        } else if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    }

    function getDashboardStats() {
        const commands = getCommandsFromFiles();
        const uptimeSeconds = Math.floor((Date.now() - global.botStartTime) / 1000);
        const uptime = formatUptime(uptimeSeconds);

        const dbPath = path.join(__dirname, '..', 'data', 'database.json');
        let totalUsers = 0;
        let totalGroups = 0;

        try {
            if (fs.existsSync(dbPath)) {
                const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
                totalUsers = Object.keys(db.Users || {}).length;
                totalGroups = Object.keys(db.Threads || {}).length;
            }
        } catch (e) {}

        return {
            totalCommands: commands.length,
            totalEvents: global.client.events.size,
            totalGroups,
            totalUsers,
            uptime,
            botName: global.config.name_bot,
            prefix: global.config.prefix,
            isLoggedIn: !!global.api
        };
    }

    app.get('/', async (req, res) => {
        try {
            const stats = getDashboardStats();
            res.render('dashboard', { stats });
        } catch (error) {
            console.error('Dashboard error:', error);
            res.status(500).send('Internal Server Error');
        }
    });

    app.get('/commands', async (req, res) => {
        try {
            const commands = getCommandsFromFiles();
            res.render('commands', { commands });
        } catch (error) {
            console.error('Commands error:', error);
            res.status(500).send('Internal Server Error');
        }
    });

    app.get('/api/stats', (req, res) => {
        res.json(getDashboardStats());
    });

    io.on('connection', (socket) => {
        console.log('Client connected to dashboard');

        socket.on('disconnect', () => {
            console.log('Client disconnected from dashboard');
        });
    });

    const PORT = global.config.dashboard_port || 5000;
    server.listen(PORT, '0.0.0.0', () => {
        logger.log(`Dashboard dang chay tai http://0.0.0.0:${PORT}`, "info");
    });

    return { app, server, io };
}

module.exports = startDashboard;
