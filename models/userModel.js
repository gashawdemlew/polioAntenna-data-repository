const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Assuming you have a separate configuration file for Sequelize

const User = sequelize.define('usertable', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  first_name: {
    type: DataTypes.STRING,
  },
  last_name: {
    type: DataTypes.STRING,
  },
  phoneNo: {
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
  gender: {
    type: DataTypes.STRING,
  },
  lat: {
    type: DataTypes.STRING,
  },
  long: {
    type: DataTypes.STRING,
  },
  user_role: {
    type: DataTypes.STRING,
  },
  password: {
    type: DataTypes.STRING,
  },
  emergency_phonno: {
    type: DataTypes.STRING,

  },

  resetPasswordToken: DataTypes.STRING,
  resetPasswordExpires: DataTypes.DATE,

  status: {
    type: DataTypes.STRING,
    defaultValue: "Active"

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

module.exports = User;
