const Sequelize = require('sequelize');
const db = require('../config/database');

const Room = db.define('room', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: false,
        primaryKey: true
    },
    capacity: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    status: {
        type: Sequelize.STRING,
        allowNull: false
    }
})

module.exports = Room;