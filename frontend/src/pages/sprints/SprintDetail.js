import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getSprint, updateSprint, deleteSprint } from '../../features/sprints/sprintSlice';
import { getSprintTasks, createTask, updateTask, deleteTask } from '../../features/tasks/taskSlice';
import { getSprintStories } from '../../features/stories/storySlice';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Spinner from '../../components/layout/Spinner';

const SprintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { sprint, loading } = useSelector(state => state.sprints);
  const { tasks } = useSelector(state => state.tasks);
  const { stories } = useSelector(state => state.stories);
  const { user } = useSelector(state => state.auth);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [taskToEdit, setTaskToEdit] = useState(null);
  
  useEffect(() => {
    dispatch(getSprint(id));
    dispatch(getSprintTasks(id));
    dispatch(getSprintStories(id));
  }, [dispatch, id]);
  
  // 编辑Sprint表单验证模式
  const validationSchema = Yup.object({
    name: Yup.string()
      .required('Sprint名称是必需的')
      .min(3, 'Sprint名称至少需要3个字符')
      .max(100, 'Sprint名称不能超过100个字符'),
    goal: Yup.string()
      .required('Sprint目标是必需的')
      .min(10, 'Sprint目标至少需要10个字符'),
    start_date: Yup.date()
      .required('开始日期是必需的'),
    end_date: Yup.date()
      .required('结束日期是必需的')
      .min(Yup.ref('start_date'), '结束日期必须晚于开始日期'),
    status: Yup.string()
      .required('Sprint状态是必需的')
  });
  
  // 添加任务表单验证模式
  const taskValidationSchema = Yup.object({
    title: Yup.string()
      .required('任务标题是必需的')
      .min(3, '任务标题至少需要3个字符')
      .max(100, '任务标题不能超过100个字符'),
    description: Yup.string()
      .required('任务描述是必需的'),
    assignee_id: Yup.string(),
    story_id: Yup.string(),
    status: Yup.string()
      .required('任务状态是必需的'),
    priority: Yup.string()
      .required('任务优先级是必需的'),
    estimated_hours: Yup.number()
      .required('预估工时是必需的')
      .min(0, '预估工时不能为负数')
  });
  
  // 提交编辑表单
  const handleSubmit = (values) => {
    dispatch(updateSprint({ id, formData: values }));
    setShowEditModal(false);
  };
  
  // 提交添加任务表单
  const handleAddTask = (values, { resetForm }) => {
    if (taskToEdit) {
      dispatch(updateTask({ id: taskToEdit.id, formData: values }));
      setTaskToEdit(null);
    } else {
      dispatch(createTask({ sprintId: id, formData: values }));
    }
    resetForm();
    setShowAddTaskModal(false);
  };
  
  // 删除Sprint
  const handleDeleteSprint = () => {
    if (window.confirm('确定要删除此Sprint吗？此操作不可逆，所有相关任务也将被删除。')) {
      dispatch(deleteSprint(id));
      navigate(`/projects/${sprint.project_id}`);
    }
  };
  
  // 删除任务
  const handleDeleteTask = (taskId) => {
    if (window.confirm('确定要删除此任务吗？此操作不可逆。')) {
      dispatch(deleteTask(taskId));
    }
  };
  
  // 编辑任务
  const handleEditTask = (task) => {
    setTaskToEdit(task);
    setShowAddTaskModal(true);
  };
  
  // 检查用户是否有编辑Sprint的权限
  const canEditSprint = user && (user.role === 'scrum_master' || user.role === 'product_owner');
  
  if (loading || !sprint) {
    return <Spinner />;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-2">
            <Link
              to={`/projects/${sprint.project_id}`}
              className="text-primary-600 hover:text-primary-800"
            >
              {sprint.project_name || '返回项目'}
            </Link>
            <span className="text-gray-500">/</span>
            <h1 className="text-2xl font-semibold text-gray-800">{sprint.name}</h1>
          </div>
          <p className="text-gray-600 mt-1">
            {new Date(sprint.start_date).toLocaleDateString()} - {new Date(sprint.end_date).toLocaleDateString()}
          </p>
        </div>
        <div className="flex space-x-2">
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              sprint.status === 'planning'
                ? 'bg-warning-100 text-warning-800'
                : sprint.status === 'active'
                ? 'bg-success-100 text-success-800'
                : sprint.status === 'completed'
                ? 'bg-secondary-100 text-secondary-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {sprint.status === 'planning' && '计划中'}
            {sprint.status === 'active' && '活跃'}
            {sprint.status === 'completed' && '已完成'}
            {sprint.status === 'cancelled' && '已取消'}
          </span>
          {canEditSprint && (
            <div className="flex space-x-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="px-3 py-1 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                编辑
              </button>
              <button
                onClick={handleDeleteSprint}
                className="px-3 py-1 bg-danger-600 text-white rounded-md hover:bg-danger-700 focus:outline-none focus:ring-2 focus:ring-danger-500 focus:ring-offset-2"
              >
                删除
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Sprint导航 */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'overview'
                  ? 'border-b-2 border-primary-500 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              概览
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'tasks'
                  ? 'border-b-2 border-primary-500 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              任务
            </button>
            <button
              onClick={() => setActiveTab('stories')}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'stories'
                  ? 'border-b-2 border-primary-500 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              用户故事
            </button>
            <button
              onClick={() => setActiveTab('burndown')}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'burndown'
                  ? 'border-b-2 border-primary-500 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              燃尽图
            </button>
          </nav>
        </div>
      </div>
      
      {/* 编辑Sprint模态框 */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">编辑Sprint</h2>
            <Formik
              initialValues={{
                name: sprint.name,
                goal: sprint.goal,
                start_date: sprint.start_date.split('T')[0],
                end_date: sprint.end_date.split('T')[0],
                status: sprint.status
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Sprint名称
                    </label>
                    <Field
                      id="name"
                      name="name"
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <ErrorMessage name="name" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                  
                  <div>
                    <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-1">
                      Sprint目标
                    </label>
                    <Field
                      as="textarea"
                      id="goal"
                      name="goal"
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <ErrorMessage name="goal" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                        开始日期
                      </label>
                      <Field
                        id="start_date"
                        name="start_date"
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <ErrorMessage name="start_date" component="div" className="text-red-500 text-xs mt-1" />
                    </div>
                    
                    <div>
                      <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                        结束日期
                      </label>
                      <Field
                        id="end_date"
                        name="end_date"
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <ErrorMessage name="end_date" component="div" className="text-red-500 text-xs mt-1" />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Sprint状态
                    </label>
                    <Field
                      as="select"
                      id="status"
                      name="status"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="planning">计划中</option>
                      <option value="active">活跃</option>
                      <option value="completed">已完成</option>
                      <option value="cancelled">已取消</option>
                    </Field>
                    <ErrorMessage name="status" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    >
                      {isSubmitting ? '保存中...' : '保存'}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}
      
      {/* 添加任务模态框 */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {taskToEdit ? '编辑任务' : '添加任务'}
            </h2>
            <Formik
              initialValues={
                taskToEdit
                  ? {
                      title: taskToEdit.title,
                      description: taskToEdit.description,
                      assignee_id: taskToEdit.assignee_id || '',
                      story_id: taskToEdit.story_id || '',
                      status: taskToEdit.status,
                      priority: taskToEdit.priority,
                      estimated_hours: taskToEdit.estimated_hours
                    }
                  : {
                      title: '',
                      description: '',
                      assignee_id: '',
                      story_id: '',
                      status: 'todo',
                      priority: 'medium',
                      estimated_hours: 1
                    }
              }
              validationSchema={taskValidationSchema}
              onSubmit={handleAddTask}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      任务标题
                    </label>
                    <Field
                      id="title"
                      name="title"
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <ErrorMessage name="title" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      任务描述
                    </label>
                    <Field
                      as="textarea"
                      id="description"
                      name="description"
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <ErrorMessage name="description" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                  
                  <div>
                    <label htmlFor="story_id" className="block text-sm font-medium text-gray-700 mb-1">
                      关联用户故事
                    </label>
                    <Field
                      as="select"
                      id="story_id"
                      name="story_id"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">无</option>
                      {stories.map(story => (
                        <option key={story.id} value={story.id}>
                          {story.title}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage name="story_id" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                  
                  <div>
                    <label htmlFor="assignee_id" className="block text-sm font-medium text-gray-700 mb-1">
                      负责人
                    </label>
                    <Field
                      as="select"
                      id="assignee_id"
                      name="assignee_id"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">未分配</option>
                      {sprint.project_members && sprint.project_members.map(member => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage name="assignee_id" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                        状态
                      </label>
                      <Field
                        as="select"
                        id="status"
                        name="status"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="todo">待处理</option>
                        <option value="in_progress">进行中</option>
                        <option value="completed">已完成</option>
                      </Field>
                      <ErrorMessage name="status" component="div" className="text-red-500 text-xs mt-1" />
                    </div>
                    
                    <div>
                      <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                        优先级
                      </label>
                      <Field
                        as="select"
                        id="priority"
                        name="priority"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="low">低</option>
                        <option value="medium">中</option>
                        <option value="high">高</option>
                      </Field>
                      <ErrorMessage name="priority" component="div" className="text-red-500 text-xs mt-1" />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="estimated_hours" className="block text-sm font-medium text-gray-700 mb-1">
                      预估工时
                    </label>
                    <Field
                      id="estimated_hours"
                      name="estimated_hours"
                      type="number"
                      min="0"
                      step="0.5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <ErrorMessage name="estimated_hours" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setTaskToEdit(null);
                        setShowAddTaskModal(false);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    >
                      {isSubmitting ? '保存中...' : '保存'}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}
    </div>
  );
};

export default SprintDetail;