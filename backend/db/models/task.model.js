import { DataTypes } from 'sequelize';
import sequelize from '../connection.js';

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('backlog', 'todo', 'in_progress', 'review', 'done'),
    defaultValue: 'backlog'
  },
  priority: {
    type: DataTypes.ENUM('lowest', 'low', 'medium', 'high', 'highest'),
    defaultValue: 'medium'
  },
  type: {
    type: DataTypes.ENUM('story', 'task', 'bug', 'epic'),
    defaultValue: 'task'
  },
  projectId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Projects',
      key: 'id'
    }
  },
  assigneeId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  reporterId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  sprintId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Sprints',
      key: 'id'
    }
  },
  storyPoints: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // 新增高级任务属性
  estimatedHours: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  optimisticEstimate: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  pessimisticEstimate: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  mostLikelyEstimate: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  riskLevel: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    allowNull: true
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  timestamps: true
});

export default Task;