const { getData, saveData, deleteData, getAll } = require('../../utils/db');
const logger = require('../../utils/logger');

module.exports = {
    getAll: () => {
        const data = getAll('Threads');
        return Object.entries(data).map(([threadId, threadData]) => ({
            threadId,
            data: threadData
        }));
    },

    getData: async (threadId) => {
        let record = getData('Threads', 'threadId', threadId);
        if (!record) {
            module.exports.createData(threadId, {
                ban: false,
                admin_only: false,
                support_only: false,
                box_only: false,
                prefix: global.config.prefix,
                antiSpam: true,
                antiLink: true
            });
            logger.log("Da tao database cho nhom: " + threadId, "info");
            record = getData('Threads', 'threadId', threadId);
        }
        return record;
    },

    setData: (threadId, data) => {
        saveData('Threads', 'threadId', threadId, data);
    },

    delData: (threadId) => {
        deleteData('Threads', threadId);
    },

    createData: (threadId, defaultData = {}) => {
        const existing = getData('Threads', 'threadId', threadId);
        if (!existing) {
            saveData('Threads', 'threadId', threadId, defaultData);
        }
    }
};
