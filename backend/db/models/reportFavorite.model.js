const { DataTypes } = require('sequelize');
const sequelize = require('../connection');

const ReportFavorite = sequelize.define('ReportFavorite', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  reportId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Reports',
      key: 'id'
    }
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['reportId']
    },
    {
      fields: ['userId', 'reportId'],
      unique: true
    }
  ]
});

module.exports = ReportFavorite;