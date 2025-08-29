import React from 'react';
import { useSelector } from 'react-redux';
import BurndownChart from '../charts/BurndownChart';
import TaskStatusChart from '../charts/TaskStatusChart';

const ProjectOverview = ({ project }) => {
  const { sprints } = useSelector((state) => state.sprint);
  const { tasks } = useSelector((state) => state.task);
  const { stories } = useSelector((state) => state.story);
  
  // 获取当前活跃的迭代
  const activeSprint = sprints.find(sprint => 
    sprint.status === 'active' && sprint.projectId === project.id
  );
  
  // 获取项目的任务
  const projectTasks = tasks.filter(task => task.projectId === project.id);
  
  // 获取项目的用户故事
  const projectStories = stories.filter(story => story.projectId === project.id);
  
  // 计算任务统计数据
  const taskStats = {
    total: projectTasks.length,
    completed: projectTasks.filter(task => task.status === 'completed').length,
    inProgress: projectTasks.filter(task => task.status === 'in-progress').length,
    review: projectTasks.filter(task => task.status === 'review').length,
    todo: projectTasks.filter(task => task.status === 'todo').length
  };
  
  // 计算故事点数统计
  const storyPointsStats = {
    total: projectTasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0),
    completed: projectTasks
      .filter(task => task.status === 'completed')
      .reduce((sum, task) => sum + (task.storyPoints || 0), 0)
  };
  
  // 计算项目进度百分比
  const calculateProgress = () => {
    if (taskStats.total === 0) return 0;
    return Math.round((taskStats.completed / taskStats.total) * 100);
  };
  
  const progress = calculateProgress();
  
  return (
    <div className="space-y-6">
      {/* 项目进度 */}
      <div className="bg-white rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">项目进度</h3>
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>总体完成度</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-500">总任务数</p>
            <p className="text-xl font-semibold">{taskStats.total}</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-green-600">已完成</p>
            <p className="text-xl font-semibold text-green-700">{taskStats.completed}</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-600">进行中</p>
            <p className="text-xl font-semibold text-blue-700">{taskStats.inProgress}</p>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-sm text-yellow-600">待办</p>
            <p className="text-xl font-semibold text-yellow-700">{taskStats.todo}</p>
          </div>
        </div>
      </div>
      
      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">任务状态分布</h3>
          <TaskStatusChart tasks={projectTasks} />
        </div>
        
        {activeSprint && (
          <div className="bg-white rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">当前迭代燃尽图</h3>
            <BurndownChart sprintId={activeSprint.id} />
          </div>
        )}
      </div>
      
      {/* 项目详情 */}
      <div className="bg-white rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">项目详情</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">开始日期</p>
            <p className="font-medium">
              {new Date(project.startDate).toLocaleDateString()}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 mb-1">预计结束日期</p>
            <p className="font-medium">
              {project.endDate
                ? new Date(project.endDate).toLocaleDateString()
                : '未设置'}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 mb-1">项目所有者</p>
            <p className="font-medium">
              {project.owner ? project.owner.name : '未设置'}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 mb-1">团队成员数</p>
            <p className="font-medium">
              {project.teamMembers ? project.teamMembers.length : 0}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 mb-1">迭代数</p>
            <p className="font-medium">{sprints.length}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 mb-1">用户故事数</p>
            <p className="font-medium">{projectStories.length}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 mb-1">总故事点数</p>
            <p className="font-medium">{storyPointsStats.total}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 mb-1">已完成故事点数</p>
            <p className="font-medium">
              {storyPointsStats.completed} ({storyPointsStats.total > 0
                ? Math.round((storyPointsStats.completed / storyPointsStats.total) * 100)
                : 0}%)
            </p>
          </div>
        </div>
      </div>
      
      {/* 项目描述 */}
      {project.description && (
        <div className="bg-white rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">项目描述</h3>
          <p className="text-gray-700 whitespace-pre-line">{project.description}</p>
        </div>
      )}
    </div>
  );
};

export default ProjectOverview;