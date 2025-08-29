import React from 'react';
import { Link } from 'react-router-dom';

const ProjectCard = ({ project }) => {
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
  
  // 计算项目进度百分比
  const calculateProgress = () => {
    if (!project.tasks || project.tasks.length === 0) {
      return 0;
    }
    
    const completedTasks = project.tasks.filter(task => task.status === 'completed').length;
    return Math.round((completedTasks / project.tasks.length) * 100);
  };
  
  const statusInfo = getStatusInfo(project.status);
  const progress = calculateProgress();
  
  return (
    <Link to={`/projects/${project.id}`} className="block">
      <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-800">{project.name}</h3>
          <span className={`text-xs px-2 py-1 rounded-full ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>进度</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div>
            <span>开始: </span>
            <span>{new Date(project.startDate).toLocaleDateString()}</span>
          </div>
          
          {project.endDate && (
            <div>
              <span>结束: </span>
              <span>{new Date(project.endDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
        
        {project.teamMembers && project.teamMembers.length > 0 && (
          <div className="mt-4 flex items-center">
            <span className="text-sm text-gray-600 mr-2">团队:</span>
            <div className="flex -space-x-2">
              {project.teamMembers.slice(0, 3).map((member, index) => (
                <div
                  key={index}
                  className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-700 border border-white"
                  title={member.name}
                >
                  {member.name.charAt(0)}
                </div>
              ))}
              
              {project.teamMembers.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-700 border border-white">
                  +{project.teamMembers.length - 3}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
};

export default ProjectCard;