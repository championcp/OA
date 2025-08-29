import React from 'react';
import { Link } from 'react-router-dom';

const ProjectItem = ({ project }) => {
  // 格式化项目状态
  const getStatusInfo = (status) => {
    switch (status) {
      case 'active':
        return {
          label: '进行中',
          color: 'bg-green-100 text-green-800'
        };
      case 'completed':
        return {
          label: '已完成',
          color: 'bg-blue-100 text-blue-800'
        };
      case 'on-hold':
        return {
          label: '已暂停',
          color: 'bg-yellow-100 text-yellow-800'
        };
      case 'cancelled':
        return {
          label: '已取消',
          color: 'bg-red-100 text-red-800'
        };
      default:
        return {
          label: status,
          color: 'bg-gray-100 text-gray-800'
        };
    }
  };
  
  const statusInfo = getStatusInfo(project.status);
  
  return (
    <Link to={`/projects/${project.id}`}>
      <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium text-gray-800">{project.name}</h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-1">{project.description}</p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProjectItem;