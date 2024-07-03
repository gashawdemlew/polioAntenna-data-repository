const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Zone = sequelize.define('zone', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  region_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'regions',
      key: 'id',
    },
  },
  zone_name: {
    type: DataTypes.STRING,
  },
});

module.exports = Zone;
