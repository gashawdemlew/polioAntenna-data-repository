const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const PatientDemography = require('./petient_demography'); // Assumed path

const LabratoryInfo = sequelize.define('labaratory_info1', {
  lab_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  epid_number: {
    type: DataTypes.STRING,
    allowNull: false, // Or whatever constraint is appropriate
    references: {
      model: PatientDemography, // Reference the PatientDemography model
      key: 'epid_number',      // Reference the 'epid_number' column in PatientDemography
    },
    onUpdate: 'CASCADE',       // Optional: Define behavior on update in patient_demography
    onDelete: 'CASCADE',       // Optional: Define behavior on delete in patient_demography
  },
  type: {
    type: DataTypes.STRING,

  },

  true_afp: {
    type: DataTypes.STRING,

  },
  final_cell_culture_result: {
    type: DataTypes.STRING,
  },
  date_cell_culture_result: {
    type: DataTypes.STRING,
  },
  final_combined_itd_result: {
    type: DataTypes.STRING,
  },
  user_id: {
    type: DataTypes.STRING,
  },
  status: {
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
