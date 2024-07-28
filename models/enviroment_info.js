const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Assuming you have a separate configuration file for Sequelize

const LabratoryInfo = sequelize.define('enviroment_info1', {
  env_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  epid_number: {
    type: DataTypes.STRING,
    // unique: true,
  },

  tempreture: {
    type: DataTypes.STRING,
  },
  // rainfall: { 
  //   type: DataTypes.STRING,
  // },
  rainfall: { 
    type: DataTypes.STRING,
  },
  humidity: {
    type: DataTypes.STRING,
  },
  cloude_status: {
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
