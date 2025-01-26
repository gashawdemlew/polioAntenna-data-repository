

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Assuming you have a separate configuration file for Sequelize

const MethrologyModel = sequelize.define('MethrologyModel1', {
  epid_number: {
    type: DataTypes.STRING,
    // unique: true,
  },
  message: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  suspected: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  confidence_interval: {
    type: DataTypes.STRING, // Adjust based on your database
    allowNull: true,
  },

});

async function syncModels() {
  try {
    await sequelize.sync({ alter: true });
    console.log('Models synchronized with the database.');
  } catch (error) {
    console.error('Unable to sync models with the database:', error);
  }
}

// Check database connection and sync models
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

module.exports = MethrologyModel;