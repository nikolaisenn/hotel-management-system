// Sequelize ORM
const Sequelize = require('sequelize');

module.exports = new Sequelize('hotel-management', 'root', 'root', {
  host: 'localhost',
  dialect: 'mysql',
  define: { timestamps: false },

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
});