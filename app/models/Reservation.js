const Sequelize = require('sequelize');
const db = require('../config/database');

const Reservation = db.define('reservation', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    room_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: 'rooms',
        referencesKey: 'id'
    },
    status: {
        type: Sequelize.STRING,
        allowNull: false
    }
})

module.exports = Reservation;