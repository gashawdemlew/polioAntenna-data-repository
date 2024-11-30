
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Like = sequelize.define('Like', {
  postId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'likes',
  timestamps: true,
});

module.exports = Like;
