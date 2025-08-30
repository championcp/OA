import React from 'react';
import { useGetReportQuery } from '../services/reportApi';
import VelocityReport from './VelocityReport';
import BurnDownReport from './BurnDownReport';
import CumulativeFlowReport from './CumulativeFlowReport';
import QualityTrendReport from './QualityTrendReport';

const ReportViewer = ({ reportId }) => {
  const { data: report, isLoading, error } = useGetReportQuery(reportId);

  if (isLoading) return <div>加载中...</div>;
  if (error) return <div>加载失败: {error.message}</div>;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">{report.name}</h2>
        <div className="flex space-x-2">
          <FavoriteButton reportId={report.id} />
          <ShareButton reportId={report.id} />
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        {/* 动态渲染不同类型的报表 */}
        {renderReportContent(report)}
      </div>
    </div>
  );
};

const renderReportContent = (report) => {
  switch (report.type) {
    case 'velocity':
      return <VelocityReport data={report.data} />;
    case 'burn-down':
      return <BurnDownReport data={report.data} />;
    case 'cumulative-flow':
      return <CumulativeFlowReport data={report.data} />;
    case 'quality-trend':
      return <QualityTrendReport data={report.data} />;
    default:
      return (
        <div className="p-4">
          <div className="bg-white rounded-lg shadow p-6">
            <pre>{JSON.stringify(report.data, null, 2)}</pre>
          </div>
        </div>
      );
  }
};

export default ReportViewer;