const Sequelize = require('sequelize');
const db = require('../config/database');

const Schedule = db.define('schedule', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    date: {
        type: Sequelize.DATE,
        allowNull: false
    },
    receptionist_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: 'receptionist',
        referencesKey: 'id'
    },
    firstname: {
        type: Sequelize.STRING,
        allowNull: true
    },
    lastname: {
        type: Sequelize.STRING,
        allowNull: true
    },
    shift: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
})

module.exports = Schedule