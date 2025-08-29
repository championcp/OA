import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getProjects } from '../../features/projects/projectSlice';
import { getAssignedTasks } from '../../features/tasks/taskSlice';
import Spinner from '../../components/layout/Spinner';
import DashboardCard from '../../components/dashboard/DashboardCard';
import TaskItem from '../../components/tasks/TaskItem';
import ProjectItem from '../../components/projects/ProjectItem';
import BurndownChart from '../../components/charts/BurndownChart';
import TaskStatusChart from '../../components/charts/TaskStatusChart';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { projects, loading: projectsLoading } = useSelector((state) => state.project);
  const { tasks, loading: tasksLoading } = useSelector((state) => state.task);

  useEffect(() => {
    dispatch(getProjects());
    dispatch(getAssignedTasks());
  }, [dispatch]);

  if (projectsLoading || tasksLoading) {
    return <Spinner />;
  }

  // 获取最近的项目（最多4个）
  const recentProjects = projects.slice(0, 4);
  
  // 获取分配给当前用户的任务（最多5个）
  const myTasks = tasks.slice(0, 5);
  
  // 计算任务统计数据
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(task => task.status === 'completed').length,
    inProgress: tasks.filter(task => task.status === 'in-progress').length,
    todo: tasks.filter(task => task.status === 'todo').length
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">欢迎回来，{user.name}</h1>
        <div>
          <Link
            to="/projects/new"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
          >
            创建新项目
          </Link>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DashboardCard
          title="我的项目"
          value={projects.length}
          icon="project"
          color="blue"
          link="/projects"
        />
        <DashboardCard
          title="待办任务"
          value={taskStats.todo}
          icon="task"
          color="yellow"
          link="/tasks"
        />
        <DashboardCard
          title="进行中任务"
          value={taskStats.inProgress}
          icon="progress"
          color="orange"
          link="/tasks"
        />
        <DashboardCard
          title="已完成任务"
          value={taskStats.completed}
          icon="completed"
          color="green"
          link="/tasks"
        />
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">任务状态分布</h2>
          <TaskStatusChart tasks={tasks} />
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">燃尽图</h2>
          <BurndownChart />
        </div>
      </div>

      {/* 我的任务和最近项目 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">我的任务</h2>
            <Link to="/tasks" className="text-blue-600 hover:text-blue-800 text-sm">
              查看全部
            </Link>
          </div>
          {myTasks.length > 0 ? (
            <div className="space-y-3">
              {myTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">暂无分配给您的任务</p>
          )}
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">最近的项目</h2>
            <Link to="/projects" className="text-blue-600 hover:text-blue-800 text-sm">
              查看全部
            </Link>
          </div>
          {recentProjects.length > 0 ? (
            <div className="space-y-3">
              {recentProjects.map((project) => (
                <ProjectItem key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">暂无项目</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;