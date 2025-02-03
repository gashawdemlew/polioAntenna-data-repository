const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('polioantennaorg_polioAntenna', 'polioantennaorg_polioantennaorg', '6zry1F5lsiED', {
  host: 'localhost',
  port: 5432, // Default PostgreSQL port
  dialect: 'postgres',
});

// const { Sequelize } = require('sequelize');

// const sequelize = new Sequelize('polio', 'postgres', '123', {
//   host: 'localhost',
//   port: 5432, // Default PostgreSQL port
//   dialect: 'postgres',
// });



module.exports = sequelize;