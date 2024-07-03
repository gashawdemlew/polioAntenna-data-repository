const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('polio', 'postgres', 'postgres', {
  host: 'localhost',
  port: 5432, // Default PostgreSQL port
  dialect: 'postgres',
});


module.exports = sequelize;
