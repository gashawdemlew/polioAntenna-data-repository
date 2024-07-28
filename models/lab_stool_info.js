const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Assuming you have a separate configuration file for Sequelize

const LabratoryInfo = sequelize.define('lab_stool_info', {
  stool_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  epid_number: {
    type: DataTypes.STRING,
  },


  stool_1_recieved_date: {
    type: DataTypes.DATE,
  },
  stool_2_recieved_date: {
    type: DataTypes.DATE,
  },
  speciement_condition: {
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
