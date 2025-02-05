const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Assuming you have a separate configuration file for Sequelize

const LabratoryInfo = sequelize.define('push_message', {
  push_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  epid_number: {
    type: DataTypes.STRING,
    unique: true,
  },

  epid_number: {
    type: DataTypes.STRING,
    unique: true,
  },

  first_name: {
    type: DataTypes.STRING,
  },
  last_name: {
    type: DataTypes.STRING,
  },
  hofficer_name: {
    type: DataTypes.STRING,
  },
  hofficer_phonno: {
    type: DataTypes.STRING,
  },
  region: {
    type: DataTypes.STRING,
  },

  zone: {
    type: DataTypes.STRING,
  },
  woreda: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.STRING,
  },
  hofficer_id: {
    type: DataTypes.STRING,
  },

  user_id: {
    type: DataTypes.STRING,
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

module.exports = LabratoryInfo;
