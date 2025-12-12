const { getData, saveData, deleteData, getAll } = require('../../utils/db');
const logger = require('../../utils/logger');

module.exports = {
    getAll: () => {
        const data = getAll('Users');
        return Object.entries(data).map(([userId, userData]) => ({
            userId,
            data: userData
        }));
    },

    getData: (userId) => {
        let record = getData('Users', 'userId', userId);
        if (!record) {
            module.exports.createData(userId, { ban: false, money: global.config.default_money || 0 });
            logger.log("Da tao database cho nguoi dung: " + userId, "info");
            record = getData('Users', 'userId', userId);
        }
        return record;
    },

    setData: (userId, data) => {
        saveData('Users', 'userId', userId, data);
    },

    delData: (userId) => {
        deleteData('Users', userId);
    },

    createData: (userId, defaultData = {}) => {
        const existing = getData('Users', 'userId', userId);
        if (!existing) {
            saveData('Users', 'userId', userId, defaultData);
        }
    }
};
