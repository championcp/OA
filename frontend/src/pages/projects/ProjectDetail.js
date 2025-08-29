import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProject, updateProject, deleteProject } from '../../features/projects/projectSlice';
import { getSprints } from '../../features/sprints/sprintSlice';
import { getStoriesByProject } from '../../features/stories/storySlice';
import { getTasksByProject } from '../../features/tasks/taskSlice';
import Spinner from '../../components/layout/Spinner';
import TabNav from '../../components/common/TabNav';
import ProjectOverview from '../../components/projects/ProjectOverview';
import SprintList from '../../components/sprints/SprintList';
import StoryList from '../../components/stories/StoryList';
import TaskBoard from '../../components/tasks/TaskBoard';
import TeamMembers from '../../components/projects/TeamMembers';
import ConfirmModal from '../../components/common/ConfirmModal';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentProject, loading } = useSelector((state) => state.project);
  const { sprints } = useSelector((state) => state.sprint);
  const { stories } = useSelector((state) => state.story);
  const { tasks } = useSelector((state) => state.task);
  const { user } = useSelector((state) => state.auth);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  useEffect(() => {
    dispatch(getProject(projectId));
    dispatch(getSprints(projectId));
    dispatch(getStoriesByProject(projectId));
    dispatch(getTasksByProject(projectId));
  }, [dispatch, projectId]);
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  const handleDeleteProject = () => {
    dispatch(deleteProject(projectId)).then(() => {
      navigate('/projects');
    });
  };
  
  // 检查当前用户是否为项目所有者或Scrum Master
  const isProjectManager = currentProject && 
    (currentProject.ownerId === user.id || 
     currentProject.teamMembers.some(member => 
       member.userId === user.id && 
       (member.role === 'Scrum Master' || member.role === 'Product Owner')
     ));
  
  const tabs = [
    { id: 'overview', label: '概览' },
    { id: 'sprints', label: '迭代' },
    { id: 'stories', label: '用户故事' },
    { id: 'board', label: '任务看板' },
    { id: 'team', label: '团队成员' }
  ];
  
  if (loading || !currentProject) {
    return <Spinner />;
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      {/* 项目标题和操作按钮 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{currentProject.name}</h1>
          <p className="text-gray-600">{currentProject.description}</p>
        </div>
        
        {isProjectManager && (
          <div className="flex mt-4 md:mt-0 space-x-3">
            <Link
              to={`/projects/${projectId}/edit`}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
            >
              编辑项目
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md"
            >
              删除项目
            </button>
          </div>
        )}
      </div>
      
      {/* 项目状态信息 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">状态</p>
          <p className="text-lg font-semibold">
            {currentProject.status === 'active' && '进行中'}
            {currentProject.status === 'completed' && '已完成'}
            {currentProject.status === 'on-hold' && '已暂停'}
            {currentProject.status === 'cancelled' && '已取消'}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">开始日期</p>
          <p className="text-lg font-semibold">
            {new Date(currentProject.startDate).toLocaleDateString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">结束日期</p>
          <p className="text-lg font-semibold">
            {currentProject.endDate 
              ? new Date(currentProject.endDate).toLocaleDateString()
              : '未设置'}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">团队成员</p>
          <p className="text-lg font-semibold">
            {currentProject.teamMembers ? currentProject.teamMembers.length : 0}
          </p>
        </div>
      </div>
      
      {/* 标签导航 */}
      <TabNav tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />
      
      {/* 标签内容 */}
      <div className="bg-white rounded-lg shadow p-6 mt-4">
        {activeTab === 'overview' && (
          <ProjectOverview project={currentProject} />
        )}
        
        {activeTab === 'sprints' && (
          <SprintList 
            projectId={projectId} 
            sprints={sprints} 
            isProjectManager={isProjectManager} 
          />
        )}
        
        {activeTab === 'stories' && (
          <StoryList 
            projectId={projectId} 
            stories={stories} 
            isProjectManager={isProjectManager} 
          />
        )}
        
        {activeTab === 'board' && (
          <TaskBoard 
            projectId={projectId} 
            tasks={tasks} 
          />
        )}
        
        {activeTab === 'team' && (
          <TeamMembers 
            projectId={projectId} 
            teamMembers={currentProject.teamMembers || []} 
            isProjectManager={isProjectManager} 
          />
        )}
      </div>
      
      {/* 删除确认对话框 */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="删除项目"
        message="您确定要删除此项目吗？此操作无法撤销，所有相关的迭代、用户故事和任务都将被删除。"
        confirmText="删除"
        cancelText="取消"
        onConfirm={handleDeleteProject}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default ProjectDetail;