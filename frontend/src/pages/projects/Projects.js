import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getProjects, createProject, deleteProject } from '../../features/projects/projectSlice';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Spinner from '../../components/layout/Spinner';

const Projects = () => {
  const dispatch = useDispatch();
  const { projects, loading } = useSelector(state => state.projects);
  const { user } = useSelector(state => state.auth);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  
  useEffect(() => {
    dispatch(getProjects());
  }, [dispatch]);
  
  // 创建项目表单验证模式
  const validationSchema = Yup.object({
    name: Yup.string()
      .required('项目名称是必需的')
      .min(3, '项目名称至少需要3个字符')
      .max(100, '项目名称不能超过100个字符'),
    description: Yup.string()
      .required('项目描述是必需的')
      .min(10, '项目描述至少需要10个字符'),
    status: Yup.string()
      .required('项目状态是必需的')
  });
  
  // 初始表单值
  const initialValues = {
    name: '',
    description: '',
    status: 'planning'
  };
  
  // 提交表单
  const handleSubmit = (values, { resetForm }) => {
    dispatch(createProject(values));
    resetForm();
    setShowCreateModal(false);
  };
  
  // 删除项目
  const handleDelete = (id) => {
    if (window.confirm('确定要删除此项目吗？此操作不可逆。')) {
      dispatch(deleteProject(id));
    }
  };
  
  // 过滤项目
  const filteredProjects = filterStatus === 'all'
    ? projects
    : projects.filter(project => project.status === filterStatus);
  
  // 检查用户是否有创建项目的权限
  const canCreateProject = user && (user.role === 'scrum_master' || user.role === 'product_owner');
  
  if (loading) {
    return <Spinner />;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">项目</h1>
        {canCreateProject && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            创建项目
          </button>
        )}
      </div>
      
      {/* 过滤器 */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex items-center space-x-4">
          <span className="text-gray-700">状态过滤：</span>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-md ${
                filterStatus === 'all'
                  ? 'bg-primary-100 text-primary-800 font-medium'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setFilterStatus('planning')}
              className={`px-3 py-1 rounded-md ${
                filterStatus === 'planning'
                  ? 'bg-warning-100 text-warning-800 font-medium'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              计划中
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1 rounded-md ${
                filterStatus === 'active'
                  ? 'bg-success-100 text-success-800 font-medium'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              活跃
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-3 py-1 rounded-md ${
                filterStatus === 'completed'
                  ? 'bg-secondary-100 text-secondary-800 font-medium'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              已完成
            </button>
          </div>
        </div>
      </div>
      
      {/* 项目列表 */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-600">暂无项目</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <div key={project.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold text-gray-800">{project.name}</h2>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      project.status === 'planning'
                        ? 'bg-warning-100 text-warning-800'
                        : project.status === 'active'
                        ? 'bg-success-100 text-success-800'
                        : 'bg-secondary-100 text-secondary-800'
                    }`}
                  >
                    {project.status === 'planning' && '计划中'}
                    {project.status === 'active' && '活跃'}
                    {project.status === 'completed' && '已完成'}
                  </span>
                </div>
                <p className="mt-2 text-gray-600 line-clamp-3">{project.description}</p>
                <div className="mt-4 flex justify-between items-center">
                  <Link
                    to={`/projects/${project.id}`}
                    className="text-primary-600 hover:text-primary-800"
                  >
                    查看详情
                  </Link>
                  {(user.role === 'scrum_master' || user.role === 'product_owner') && (
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="text-danger-600 hover:text-danger-800"
                    >
                      删除
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* 创建项目模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">创建新项目</h2>
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      项目名称
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
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      项目描述
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
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      项目状态
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
                    </Field>
                    <ErrorMessage name="status" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    >
                      {isSubmitting ? '创建中...' : '创建'}
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

export default Projects;