const Sequelize = require('sequelize');
const db = require('../config/database');
const Schedule = require('./Schedule')

const Receptionist = db.define('receptionist', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    firstname: {
        type: Sequelize.STRING,
        allowNull: true
    },
    lastname: {
        type: Sequelize.STRING,
        allowNull: true
    },
    email: {
        type: Sequelize.STRING,
        allowNull: true
    },
    username: {
        type: Sequelize.STRING,
        allowNull: true
    },
    password: {
        type: Sequelize.STRING,
        allowNull: true
    },
    address: {
        type: Sequelize.STRING,
        allowNull: true
    },
})

Receptionist.hasMany(Schedule, { foreignKey: 'receptionist_id'});

module.exports = Receptionist