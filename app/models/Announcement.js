const Sequelize = require('sequelize');
const db = require('../config/database');

const Announcement = db.define('announcement', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    text: {
        type: Sequelize.STRING,
        allowNull: false
    },
    publishDate: {
        type: Sequelize.DATE,
        allowNull: false
    }
})

module.exports = Announcement;