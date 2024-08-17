const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Assuming you have a separate configuration file for Sequelize

const demographic = sequelize.define('demographic_by_vol', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
      region: {
        type: DataTypes.STRING,
      },
      zone: {
        type: DataTypes.STRING,
      },
      woreda: {
        type: DataTypes.STRING,
      },
      lat: {
        type: DataTypes.STRING,
      },
      long: {
        type: DataTypes.STRING,
      },
      iamge_path: {
        type: DataTypes.STRING,
        unique: true,
      },
      viedeo_path: {
        type: DataTypes.STRING,
      },
      phonNo: {
        type: DataTypes.STRING,
      },
      gender: {
        type: DataTypes.STRING,
      },
    
  

      selected_health_officcer: {
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

module.exports = demographic;
