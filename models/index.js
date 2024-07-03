const sequelize = require('../config/database');
const Region = require('./region');
const Zone = require('./zone');
const Wereda = require('./woreda');

Region.hasMany(Zone, { foreignKey: 'region_id' });
Zone.belongsTo(Region, { foreignKey: 'region_id' });
Zone.hasMany(Wereda, { foreignKey: 'zone_id' });
Wereda.belongsTo(Zone, { foreignKey: 'zone_id' });

async function syncModels() {
  try {
    await sequelize.sync({ alter: true });
    console.log('Models synchronized with the database.');
  } catch (error) {
    console.error('Unable to sync models with the database:', error);
  }
}

async function initialize() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    await syncModels();
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

initialize();

module.exports = {
  Region,
  Zone,
  Wereda,
};
