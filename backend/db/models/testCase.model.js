const { DataTypes } = require('sequelize');
const sequelize = require('../connection');

const TestCase = sequelize.define('TestCase', {
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
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  preconditions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  testSteps: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  expectedResult: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium'
  },
  status: {
    type: DataTypes.ENUM('draft', 'ready', 'obsolete'),
    defaultValue: 'draft'
  },
  type: {
    type: DataTypes.ENUM('functional', 'integration', 'performance', 'security', 'usability'),
    defaultValue: 'functional'
  },
  estimatedDuration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '预估执行时间（分钟）'
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  automationStatus: {
    type: DataTypes.ENUM('not_automated', 'automated', 'in_progress'),
    defaultValue: 'not_automated'
  },
  automationId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '自动化测试ID或链接'
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['taskId']
    },
    {
      fields: ['priority']
    },
    {
      fields: ['status']
    },
    {
      fields: ['type']
    },
    {
      fields: ['automationStatus']
    }
  ]
});

module.exports = TestCase;