const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Assuming you have a separate configuration file for Sequelize

const Committe = sequelize.define('Committe_result', {

  epid_number: {
    type: DataTypes.STRING,
    // unique: true,
  },
  result: {
    type: DataTypes.STRING,

  },
  phone_no: {
    type: DataTypes.STRING,
  },

  description: {
    type: DataTypes.STRING,
  },

  full_name: {
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

module.exports = Committe;
