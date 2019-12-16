const Sequelize = require('sequelize');
const db = require('../config/database');

const User = db.define('user', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    client_id: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    receptionist_id: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    manager_id: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    owner_id: {
        type: Sequelize.INTEGER,
        allowNull: true
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
    usertype: {
        type: Sequelize.STRING,
        allowNull: true
    }
})

module.exports = User;