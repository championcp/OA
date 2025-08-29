import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addTeamMember, updateTeamMember, removeTeamMember } from '../../features/projects/projectSlice';
import Modal from '../common/Modal';
import ConfirmModal from '../common/ConfirmModal';

const TeamMembers = ({ projectId, teamMembers, isProjectManager }) => {
  const dispatch = useDispatch();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  
  const [formData, setFormData] = useState({
    email: '',
    role: 'Developer'
  });
  
  // 处理表单输入变化
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // 处理添加团队成员
  const handleAddMember = (e) => {
    e.preventDefault();
    
    dispatch(addTeamMember({
      projectId,
      memberData: formData
    })).then(() => {
      setShowAddModal(false);
      setFormData({
        email: '',
        role: 'Developer'
      });
    });
  };
  
  // 处理编辑团队成员
  const handleEditMember = (e) => {
    e.preventDefault();
    
    dispatch(updateTeamMember({
      projectId,
      memberId: selectedMember.id,
      memberData: {
        role: formData.role
      }
    })).then(() => {
      setShowEditModal(false);
      setSelectedMember(null);
    });
  };
  
  // 处理删除团队成员
  const handleDeleteMember = () => {
    dispatch(removeTeamMember({
      projectId,
      memberId: selectedMember.id
    })).then(() => {
      setShowDeleteModal(false);
      setSelectedMember(null);
    });
  };
  
  // 打开编辑模态框
  const openEditModal = (member) => {
    setSelectedMember(member);
    setFormData({
      ...formData,
      role: member.role
    });
    setShowEditModal(true);
  };
  
  // 打开删除确认模态框
  const openDeleteModal = (member) => {
    setSelectedMember(member);
    setShowDeleteModal(true);
  };
  
  // 获取角色标签颜色
  const getRoleColor = (role) => {
    switch (role) {
      case 'Scrum Master':
        return 'bg-purple-100 text-purple-800';
      case 'Product Owner':
        return 'bg-blue-100 text-blue-800';
      case 'Developer':
        return 'bg-green-100 text-green-800';
      case 'Designer':
        return 'bg-pink-100 text-pink-800';
      case 'Tester':
        return 'bg-yellow-100 text-yellow-800';
      case 'Stakeholder':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">团队成员</h2>
        {isProjectManager && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
          >
            添加成员
          </button>
        )}
      </div>
      
      {teamMembers.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  成员
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  角色
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  加入日期
                </th>
                {isProjectManager && (
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teamMembers.map((member) => (
                <tr key={member.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-700 font-medium text-sm">
                          {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {member.name || '未知用户'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {member.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(member.role)}`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </td>
                  {isProjectManager && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(member)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => openDeleteModal(member)}
                        className="text-red-600 hover:text-red-900"
                      >
                        移除
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">
          该项目暂无团队成员
        </p>
      )}
      
      {/* 添加成员模态框 */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="添加团队成员"
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              邮箱地址
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              如果用户已注册，将直接添加；否则将发送邀请邮件
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              角色
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Scrum Master">Scrum Master</option>
              <option value="Product Owner">Product Owner</option>
              <option value="Developer">Developer</option>
              <option value="Designer">Designer</option>
              <option value="Tester">Tester</option>
              <option value="Stakeholder">Stakeholder</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              添加
            </button>
          </div>
        </form>
      </Modal>
      
      {/* 编辑成员模态框 */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="编辑团队成员"
      >
        {selectedMember && (
          <form onSubmit={handleEditMember} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                成员
              </label>
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-700 font-medium text-sm">
                    {selectedMember.name ? selectedMember.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">
                    {selectedMember.name || '未知用户'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {selectedMember.email}
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                角色
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Scrum Master">Scrum Master</option>
                <option value="Product Owner">Product Owner</option>
                <option value="Developer">Developer</option>
                <option value="Designer">Designer</option>
                <option value="Tester">Tester</option>
                <option value="Stakeholder">Stakeholder</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
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
        )}
      </Modal>
      
      {/* 删除确认模态框 */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="移除团队成员"
        message={`您确定要将 ${selectedMember?.name || selectedMember?.email || '此成员'} 从项目中移除吗？`}
        confirmText="移除"
        cancelText="取消"
        onConfirm={handleDeleteMember}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default TeamMembers;