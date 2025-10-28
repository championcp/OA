import { DataTypes } from 'sequelize';
import sequelize from '../connection.js';

const ReportFavorite = sequelize.define('ReportFavorite', {
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
  reportId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Reports',
      key: 'id'
    }
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['reportId']
    },
    {
      fields: ['userId', 'reportId'],
      unique: true
    }
  ]
});

export default ReportFavorite;