const Sequelize = require('sequelize');
const db = require('../config/database');

const Payslip = db.define('payslip', {
    receptionist_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: 'receptionist',
        referencesKey: 'id'
    },
    firstname: {
        type: Sequelize.STRING,
        allowNull: false
    },
    lastname: {
        type: Sequelize.STRING,
        allowNull: false
    },
    hours: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    rate: {
        type: Sequelize.FLOAT,
        allowNull: false
    },
    gross_pay: {
        type: Sequelize.DOUBLE,
        allowNull: false
    },
    tax: {
        type: Sequelize.DOUBLE,
        allowNull: false
    },
    national_insurance: {
        type: Sequelize.DOUBLE,
        allowNull: false
    },
    net_pay: {
        type: Sequelize.DOUBLE,
        allowNull: false
    },
    month: {
        type: Sequelize.STRING,
        allowNull: false
    },
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    }
})

module.exports = Payslip