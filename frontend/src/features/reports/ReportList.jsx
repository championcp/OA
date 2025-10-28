import React from 'react';
import { Link } from 'react-router-dom';
import { useGetTemplatesQuery } from '../../services/reportApi';

const ReportList = () => {
  const { data: templates, isLoading, error } = useGetTemplatesQuery();

  if (isLoading) return <div>加载模板中...</div>;
  if (error) return <div>加载失败: {error.message}</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">报表模板</h2>
        <Link 
          to="/reports/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          新建报表
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(templates).map(([type, template]) => (
          <div key={type} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold mb-2">{template.name}</h3>
            <p className="text-gray-600 mb-4">{template.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {template.metrics.join(' • ')}
              </span>
              <Link
                to={`/reports/generate?type=${type}`}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                生成报表
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportList;