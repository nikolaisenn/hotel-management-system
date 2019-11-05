const Sequelize = require('sequelize');
const db = require('../config/database');

const Client = db.define('client', {
    id: {
        type: Sequelize.STRING,
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

module.exports = Client;