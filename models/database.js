const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('polio', 'postgres', '123', {
  host: '127.0.0.1',
  port: 5432, // Default PostgreSQL port
  dialect: 'postgres',
});


module.exports = sequelize;