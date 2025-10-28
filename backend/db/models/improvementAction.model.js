import { DataTypes } from 'sequelize';
import sequelize from '../connection.js';

const ImprovementAction = sequelize.define('ImprovementAction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  sprintId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Sprints',
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
  category: {
    type: DataTypes.ENUM(
      'process',
      'technical',
      'team',
      'communication',
      'quality'
    ),
    defaultValue: 'process'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium'
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  assignedTo: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  resolutionNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  estimatedEffort: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '预估工作量（小时）'
  },
  actualEffort: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '实际工作量（小时）'
  },
  impactScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 10
    }
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['sprintId']
    },
    {
      fields: ['assignedTo']
    },
    {
      fields: ['status']
    },
    {
      fields: ['priority']
    }
  ]
});

// 关联关系
import Sprint from './sprint.model.js';
import User from './user.model.js';

ImprovementAction.belongsTo(Sprint, { foreignKey: 'sprintId' });
ImprovementAction.belongsTo(User, { 
  foreignKey: 'assignedTo',
  as: 'assignee'
});

export default ImprovementAction;