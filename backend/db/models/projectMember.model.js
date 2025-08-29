const { DataTypes } = require('sequelize');
const sequelize = require('../connection');

const ProjectMember = sequelize.define('ProjectMember', {
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
  projectId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Projects',
      key: 'id'
    }
  },
  role: {
    type: DataTypes.ENUM('owner', 'manager', 'member', 'viewer'),
    defaultValue: 'member'
  },
  permissions: {
    type: DataTypes.JSONB,
    defaultValue: {
      view: true,
      edit: false,
      delete: false,
      manage: false
    }
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'projectId']
    }
  ]
});

module.exports = ProjectMember;