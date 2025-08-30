const { DataTypes } = require('sequelize');
const sequelize = require('../connection');

const ShareLink = sequelize.define('ShareLink', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
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
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  permissions: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: ['view']
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['token'],
      unique: true
    },
    {
      fields: ['userId']
    },
    {
      fields: ['reportId']
    }
  ]
});

module.exports = ShareLink;