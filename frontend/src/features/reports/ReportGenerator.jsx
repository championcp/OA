import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  useGenerateReportMutation,
  useGetTemplatesQuery 
} from '../../services/reportApi';

const ReportGenerator = () => {
  const [searchParams] = useSearchParams();
  const reportType = searchParams.get('type');
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    period: 'last_4_sprints',
    filters: {}
  });

  const { data: templates } = useGetTemplatesQuery();
  const [generateReport, { isLoading }] = useGenerateReportMutation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await generateReport({
        projectId: 'current', // 实际使用时应从路由或状态获取
        config: {
          type: reportType,
          ...formData
        }
      }).unwrap();
      navigate(`/reports/${result.id}`);
    } catch (error) {
      console.error('生成报表失败:', error);
    }
  };

  if (!templates || !reportType) return <div>加载中...</div>;

  const template = templates[reportType];

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow p-6 max-w-3xl mx-auto">
        <h2 className="text-xl font-bold mb-4">生成报表: {template.name}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">报表名称</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">描述</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              rows="3"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">时间范围</label>
            <select
              name="period"
              value={formData.period}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="last_2_sprints">最近2个迭代</option>
              <option value="last_4_sprints">最近4个迭代</option>
              <option value="last_30_days">最近30天</option>
              <option value="last_90_days">最近90天</option>
            </select>
          </div>

          {/* 动态表单字段基于模板类型 */}
          {template.metrics.includes('velocity') && (
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="includeVelocity"
                  checked={formData.filters.includeVelocity || false}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    filters: {
                      ...prev.filters,
                      includeVelocity: e.target.checked
                    }
                  }))}
                  className="mr-2"
                />
                包含详细速度分析
              </label>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/reports')}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? '生成中...' : '生成报表'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportGenerator;