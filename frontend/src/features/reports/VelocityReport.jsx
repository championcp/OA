import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';

const VelocityReport = ({ data }) => {
  const chartData = {
    labels: data.map(item => item.sprintName),
    datasets: [
      {
        label: '承诺点数',
        data: data.map(item => item.committed),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
      {
        label: '完成点数',
        data: data.map(item => item.completed),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: '实际速度',
        data: data.map(item => item.velocity),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: '团队速率报表',
      },
      tooltip: {
        callbacks: {
          afterLabel: (context) => {
            const index = context.dataIndex;
            const item = data[index];
            return [
              `达成率: ${Math.round((item.completed / item.committed) * 100)}%`,
              `平均速度: ${Math.round(data.reduce((sum, d) => sum + d.velocity, 0) / data.length)}`
            ];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: '故事点数'
        }
      }
    }
  };

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <Bar data={chartData} options={options} />
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded">
            <h3 className="font-bold text-blue-800">平均速度</h3>
            <p className="text-2xl">
              {Math.round(data.reduce((sum, d) => sum + d.velocity, 0) / data.length)}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded">
            <h3 className="font-bold text-green-800">最高速度</h3>
            <p className="text-2xl">
              {Math.max(...data.map(d => d.velocity))}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded">
            <h3 className="font-bold text-purple-800">最低速度</h3>
            <p className="text-2xl">
              {Math.min(...data.map(d => d.velocity))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VelocityReport;