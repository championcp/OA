import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getProjects } from '../../features/projects/projectSlice';
import Spinner from '../../components/layout/Spinner';
import ProjectCard from '../../components/projects/ProjectCard';
import SearchBar from '../../components/common/SearchBar';
import FilterDropdown from '../../components/common/FilterDropdown';

const ProjectList = () => {
  const dispatch = useDispatch();
  const { projects, loading } = useSelector((state) => state.project);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    dispatch(getProjects());
  }, [dispatch]);

  // 处理搜索
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  // 处理状态筛选
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
  };

  // 筛选项目
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // 状态选项
  const statusOptions = [
    { value: 'all', label: '全部状态' },
    { value: 'active', label: '进行中' },
    { value: 'completed', label: '已完成' },
    { value: 'on-hold', label: '已暂停' },
    { value: 'cancelled', label: '已取消' }
  ];

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">项目列表</h1>
        <Link
          to="/projects/new"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
        >
          创建新项目
        </Link>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="md:w-2/3">
          <SearchBar
            placeholder="搜索项目名称或描述..."
            onSearch={handleSearch}
          />
        </div>
        <div className="md:w-1/3">
          <FilterDropdown
            label="状态"
            options={statusOptions}
            value={statusFilter}
            onChange={handleStatusFilter}
          />
        </div>
      </div>

      {/* 项目列表 */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500 text-lg">
            {searchTerm || statusFilter !== 'all'
              ? '没有找到匹配的项目'
              : '暂无项目，点击"创建新项目"按钮开始'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProjectList;