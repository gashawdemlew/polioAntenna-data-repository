

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Assuming you have a separate configuration file for Sequelize
const PatientDemography = require('./petient_demography'); // Assumed path

const ImageModel = sequelize.define('ImageModel1', {
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
    message: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    suspected: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    confidence_interval: {
        type: DataTypes.STRING, // Adjust based on your database
        allowNull: true,
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

module.exports = ImageModel;