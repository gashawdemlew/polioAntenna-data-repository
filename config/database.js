const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('polioantennaorg_polioCollector', 'polioantennaorg_polioantennaorg', '6zry1F5lsiED', {
  host: 'localhost',
  port: 5432, // Default PostgreSQL port
  dialect: 'postgres',
});


module.exports = sequelize;