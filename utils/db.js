const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'database.json');

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ Users: {}, Threads: {}, Settings: {} }, null, 2));
}

function readDB() {
    try {
        const data = fs.readFileSync(dbPath, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return { Users: {}, Threads: {}, Settings: {} };
    }
}

function writeDB(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
}

function getData(table, keyField, keyValue) {
    const db = readDB();
    if (!db[table]) db[table] = {};
    const record = db[table][keyValue];
    if (record) {
        return { [keyField]: keyValue, data: record };
    }
    return null;
}

function saveData(table, keyField, keyValue, data) {
    const db = readDB();
    if (!db[table]) db[table] = {};
    db[table][keyValue] = data;
    writeDB(db);
}

function deleteData(table, keyValue) {
    const db = readDB();
    if (db[table] && db[table][keyValue]) {
        delete db[table][keyValue];
        writeDB(db);
    }
}

function getAll(table) {
    const db = readDB();
    return db[table] || {};
}

function getSetting(key) {
    const db = readDB();
    if (!db.Settings) db.Settings = {};
    return db.Settings[key] || null;
}

function setSetting(key, value) {
    const db = readDB();
    if (!db.Settings) db.Settings = {};
    db.Settings[key] = value;
    writeDB(db);
}

module.exports = {
    getData,
    saveData,
    deleteData,
    getAll,
    getSetting,
    setSetting,
    readDB,
    writeDB
};
