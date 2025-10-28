import { DataTypes } from 'sequelize';
import sequelize from '../connection.js';

const DefectAnalysis = sequelize.define('DefectAnalysis', {
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
  rootCause: {
    type: DataTypes.ENUM(
      'requirements',
      'design',
      'implementation',
      'testing',
      'environment',
      'deployment',
      'documentation',
      'communication',
      'process',
      'unknown'
    ),
    allowNull: false
  },
  causeCategory: {
    type: DataTypes.ENUM(
      'technical',
      'process',
      'human',
      'environmental',
      'organizational'
    ),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  impactLevel: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium'
  },
  recurrenceProbability: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium'
  },
  correctiveActions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  preventiveActions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  analyzedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  analysisDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  evidence: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: '分析证据或相关文档链接'
  },
  status: {
    type: DataTypes.ENUM('draft', 'reviewed', 'approved', 'implemented'),
    defaultValue: 'draft'
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['taskId']
    },
    {
      fields: ['rootCause']
    },
    {
      fields: ['causeCategory']
    },
    {
      fields: ['impactLevel']
    },
    {
      fields: ['analyzedBy']
    }
  ]
});

export default DefectAnalysis;