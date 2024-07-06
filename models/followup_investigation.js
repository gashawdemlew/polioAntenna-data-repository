const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Assuming you have a separate configuration file for Sequelize

const FollowUp = sequelize.define('followup_investigation', {
  followup_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  epid_number: {
    type: DataTypes.STRING,
    // unique: true,
  },
  date_follow_up_investigation: {
    type: DataTypes.DATE,
  },
  residual_paralysis: {
    type: DataTypes.STRING,
  },
  date_of_date: {
    type: DataTypes.DATE,
  },
  paralysis_progressed: {
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

module.exports = FollowUp;
