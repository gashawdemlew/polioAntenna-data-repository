const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Wereda = sequelize.define('wereda', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  zone_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'zones',
      key: 'id',
    },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Wereda;
