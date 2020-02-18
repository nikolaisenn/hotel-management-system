const Sequelize = require('sequelize');
const db = require('../config/database');

const Notification = db.define('notification', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    recipient_class: {
        type: Sequelize.STRING,
        allowNull: false
    },
    recipient_id: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    message: {
        type: Sequelize.STRING,
        allowNull: false
    },
    issue_time: {
        type: Sequelize.DATE,
        allowNull: false
    }
})

module.exports = Notification;