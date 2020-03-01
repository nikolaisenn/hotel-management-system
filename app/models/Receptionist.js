const Sequelize = require('sequelize');
const db = require('../config/database');
const Schedule = require('./Schedule')
const Payslip = require('./Payslip')

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
    hourly_rate: {
        type: Sequelize.FLOAT,
        allowNull: false
    },
    hours_prevmonth: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    hours_thismonth: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    hours_nextmonth: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
})

Receptionist.hasMany(Schedule, { foreignKey: 'receptionist_id'});
Receptionist.hasMany(Payslip, { foreignKey: 'receptionist_id'});

module.exports = Receptionist