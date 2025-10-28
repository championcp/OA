import { DataTypes } from 'sequelize';
import sequelize from '../connection.js';

const Sprint = sequelize.define('Sprint', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  goal: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('planning', 'active', 'completed'),
    defaultValue: 'planning'
  },
  projectId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Projects',
      key: 'id'
    }
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '团队在这个Sprint的总工作能力（小时）'
  },
  actualVelocity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '实际完成的故事点数'
  },
  plannedVelocity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '计划完成的故事点数'
  },
  retrospectiveNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  teamHealthScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 10
    }
  }
}, {
  timestamps: true
});

export default Sprint;