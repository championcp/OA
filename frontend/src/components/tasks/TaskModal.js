import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateTask, deleteTask } from '../../features/tasks/taskSlice';
import Modal from '../common/Modal';

const TaskModal = ({ isOpen, onClose, task, projectId }) => {
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.auth);
  const { sprints } = useSelector((state) => state.sprint);
  const { stories } = useSelector((state) => state.story);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: '',
    priority: '',
    storyPoints: '',
    assigneeId: '',
    sprintId: '',
    storyId: '',
    dueDate: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        storyPoints: task.storyPoints || '',
        assigneeId: task.assigneeId || '',
        sprintId: task.sprintId || '',
        storyId: task.storyId || '',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
      });
    }
  }, [task]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 转换数据类型
    const taskData = {
      ...formData,
      storyPoints: formData.storyPoints ? parseInt(formData.storyPoints, 10) : null,
      assigneeId: formData.assigneeId || null,
      sprintId: formData.sprintId || null,
      storyId: formData.storyId || null
    };
    
    dispatch(updateTask({
      projectId,
      taskId: task.id,
      taskData
    })).then(() => {
      setIsEditing(false);
    });
  };
  
  const handleDelete = () => {
    if (window.confirm('确定要删除此任务吗？此操作无法撤销。')) {
      dispatch(deleteTask({
        projectId,
        taskId: task.id
      })).then(() => {
        onClose();
      });
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
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? '编辑任务' : '任务详情'}>
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              标题
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              描述
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                状态
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todo">待办</option>
                <option value="in-progress">进行中</option>
                <option value="review">审核中</option>
                <option value="completed">已完成</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                优先级
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                故事点数
              </label>
              <input
                type="number"
                name="storyPoints"
                value={formData.storyPoints}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                截止日期
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                负责人
              </label>
              <select
                name="assigneeId"
                value={formData.assigneeId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">未分配</option>
                {users && users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                迭代
              </label>
              <select
                name="sprintId"
                value={formData.sprintId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">未分配</option>
                {sprints && sprints.map(sprint => (
                  <option key={sprint.id} value={sprint.id}>
                    {sprint.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              用户故事
            </label>
            <select
              name="storyId"
              value={formData.storyId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">未关联</option>
              {stories && stories.map(story => (
                <option key={story.id} value={story.id}>
                  {story.title}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              保存
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
            <p className="mt-1 text-sm text-gray-600">{task.description}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">状态</p>
              <p className="mt-1">{formatStatus(task.status)}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500">优先级</p>
              <p className="mt-1">{formatPriority(task.priority)}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">故事点数</p>
              <p className="mt-1">{task.storyPoints || '未设置'}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500">截止日期</p>
              <p className="mt-1">
                {task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString()
                  : '未设置'}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">负责人</p>
              <p className="mt-1">
                {task.assigneeId && users
                  ? users.find(user => user.id === task.assigneeId)?.name
                  : '未分配'}
              </p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500">迭代</p>
              <p className="mt-1">
                {task.sprintId && sprints
                  ? sprints.find(sprint => sprint.id === task.sprintId)?.name
                  : '未分配'}
              </p>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500">用户故事</p>
            <p className="mt-1">
              {task.storyId && stories
                ? stories.find(story => story.id === task.storyId)?.title
                : '未关联'}
            </p>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={handleDelete}
              className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
            >
              删除
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              编辑
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default TaskModal;