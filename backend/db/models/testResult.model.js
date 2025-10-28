import { DataTypes } from 'sequelize';
import sequelize from '../connection.js';

const TestResult = sequelize.define('TestResult', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  testCaseId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'TestCases',
      key: 'id'
    }
  },
  executedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('passed', 'failed', 'blocked', 'skipped', 'not_executed'),
    defaultValue: 'not_executed'
  },
  actualResult: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  executionTime: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '实际执行时间（分钟）'
  },
  environment: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '测试环境信息'
  },
  buildVersion: {
    type: DataTypes.STRING,
    allowNull: true
  },
  defectId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Tasks',
      key: 'id'
    },
    comment: '关联的缺陷ID'
  },
  attachments: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: '附件链接或路径'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  executionDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['testCaseId']
    },
    {
      fields: ['executedBy']
    },
    {
      fields: ['status']
    },
    {
      fields: ['executionDate']
    },
    {
      fields: ['buildVersion']
    }
  ]
});

export default TestResult;