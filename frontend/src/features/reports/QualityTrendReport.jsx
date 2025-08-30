import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';

const QualityTrendReport = ({ data }) => {
  const chartData = {
    labels: data.periods,
    datasets: [
      {
        label: '缺陷数量',
        data: data.defectCounts,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        yAxisID: 'y',
      },
      {
        label: '测试通过率(%)',
        data: data.passRates,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        yAxisID: 'y1',
      }
    ]
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: '质量趋势报告',
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: '缺陷数量'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        min: 0,
        max: 100,
        title: {
          display: true,
          text: '通过率(%)'
        },
        grid: {
          drawOnChartArea: false,
        },
      }
    }
  };

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default QualityTrendReport;