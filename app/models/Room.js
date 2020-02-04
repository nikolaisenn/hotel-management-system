const Sequelize = require('sequelize');
const db = require('../config/database');
const Reservation = require('./Reservation');

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
    price_adult: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    price_child: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    type: {
        type: Sequelize.STRING,
        allowNull: false
    },
    status: {
        type: Sequelize.STRING,
        allowNull: false
    }
})

Room.hasMany(Reservation, { foreignKey: 'room_id'});

module.exports = Room;