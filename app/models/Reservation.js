const Sequelize = require('sequelize');
const db = require('../config/database');
const Room = require('./Room');

const Reservation = db.define('reservation', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    room_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: 'rooms',
        referencesKey: 'id'
    },
    date_in: {
        type: Sequelize.DATE,
        allowNull: true
    },
    date_out: {
        type: Sequelize.DATE,
        allowNull: true
    }
})

module.exports = Reservation;