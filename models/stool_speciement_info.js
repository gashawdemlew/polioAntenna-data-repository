const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Assuming you have a separate configuration file for Sequelize

const StoolSpeciement = sequelize.define('stool_speciement_info', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  epid_number: {
    type: DataTypes.STRING,
    // unique: true,
  },
  date_stool_1_collected: {
    type: DataTypes.DATE,
  },
  date_stool_2_collected: {
    type: DataTypes.DATE,
  },

  date_stool_1_sent_lab: {
    type: DataTypes.DATE,
  },
  date_stool_2_sent_lab: {
    type: DataTypes.DATE,
  },
  case_contact: {
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

module.exports = StoolSpeciement;
