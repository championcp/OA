import React from 'react';
import { useSelector } from 'react-redux';

const TaskCard = ({ task }) => {
  const { users } = useSelector((state) => state.auth);
  
  // 获取任务负责人信息
  const assignee = users?.find(user => user.id === task.assigneeId);
  
  // 根据任务状态设置不同的颜色
  const getStatusColor = (status) => {
    switch (status) {
      case 'todo':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'review':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // 根据任务优先级设置不同的颜色
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // 格式化任务状态显示文本
  const formatStatus = (status) => {
    switch (status) {
      case 'todo':
        return '待办';
      case 'in-progress':
        return '进行中';
      case 'review':
        return '审核中';
      case 'completed':
        return '已完成';
      default:
        return status;
    }
  };
  
  // 格式化任务优先级显示文本
  const formatPriority = (priority) => {
    switch (priority) {
      case 'high':
        return '高';
      case 'medium':
        return '中';
      case 'low':
        return '低';
      default:
        return priority;
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-3 cursor-pointer hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-800 line-clamp-2">{task.title}</h3>
        {task.storyPoints && (
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
            {task.storyPoints} 点
          </span>
        )}
      </div>
      
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
      
      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(task.status)}`}>
          {formatStatus(task.status)}
        </span>
        
        <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
          优先级: {formatPriority(task.priority)}
        </span>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          {assignee ? (
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-700 mr-1">
                {assignee.name.charAt(0)}
              </div>
              <span className="text-xs text-gray-600">{assignee.name}</span>
            </div>
          ) : (
            <span className="text-xs text-gray-500">未分配</span>
          )}
        </div>
        
        {task.dueDate && (
          <div className="text-xs text-gray-500">
            截止: {new Date(task.dueDate).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;