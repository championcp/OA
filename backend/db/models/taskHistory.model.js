const { DataTypes } = require('sequelize');
const sequelize = require('../connection');

const TaskHistory = sequelize.define('TaskHistory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  taskId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Tasks',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  action: {
    type: DataTypes.ENUM('create', 'update', 'delete', 'status_change', 'conflict_resolution'),
    allowNull: false
  },
  changes: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['taskId']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['createdAt']
    }
  ]
});

// 关联关系
TaskHistory.belongsTo(require('./task.model'), { foreignKey: 'taskId' });
TaskHistory.belongsTo(require('./user.model'), { foreignKey: 'userId' });

module.exports = TaskHistory;