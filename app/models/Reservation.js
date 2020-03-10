const Sequelize = require('sequelize');
const db = require('../config/database');

const Reservation = db.define('reservation', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    email: {
        type: Sequelize.STRING,
        allowNull: true
    },
    user_id: {
        type: Sequelize.INTEGER,
        allowNull: true
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