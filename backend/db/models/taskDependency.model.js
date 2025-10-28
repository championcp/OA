import { DataTypes } from 'sequelize';
import sequelize from '../connection.js';

const TaskDependency = sequelize.define('TaskDependency', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  sourceTaskId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Tasks',
      key: 'id'
    }
  },
  targetTaskId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Tasks',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish'),
    defaultValue: 'finish_to_start'
  },
  lag: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '依赖延迟时间（小时）'
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['sourceTaskId', 'targetTaskId']
    }
  ]
});

export default TaskDependency;