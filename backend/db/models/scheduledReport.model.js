const { DataTypes } = require('sequelize');
const sequelize = require('../connection');

const ScheduledReport = sequelize.define('ScheduledReport', {
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
  reportType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  schedule: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Cron表达式或固定周期如daily/weekly/monthly'
  },
  recipients: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: '收件人邮箱列表'
  },
  config: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  lastRunAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  nextRunAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['projectId']
    },
    {
      fields: ['nextRunAt']
    }
  ]
});

module.exports = ScheduledReport;