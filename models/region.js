const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Region = sequelize.define('region', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  region_name: {
    type: DataTypes.STRING,
    unique: true,
  },
});

module.exports = Region;
