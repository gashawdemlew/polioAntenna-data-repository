const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Assuming you have a separate configuration file for Sequelize

const ClinicalHistory = sequelize.define('clinical_history', {
  clinfo_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  epid_number: {
    type: DataTypes.STRING,
    // unique: true,
  },
  date_after_onset: {
    type: DataTypes.DATE,
  },
  fever_at_onset: {
    type: DataTypes.STRING,
  },
  flaccid_sudden_paralysis: {
    type: DataTypes.STRING,
  },
  paralysis_progressed: {
    type: DataTypes.STRING,
  },
  asymmetric: {
    type: DataTypes.STRING,
  },
  site_of_paralysis: {
    type: DataTypes.STRING,
  },
  total_opv_doses: {
    type: DataTypes.INTEGER,
  },
  admitted_to_hospital: {
    type: DataTypes.STRING,
  },
  date_of_admission: {
    type: DataTypes.STRING,
  },
  medical_record_no: {
    type: DataTypes.STRING,
  },
  facility_name: {
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

module.exports = ClinicalHistory;
