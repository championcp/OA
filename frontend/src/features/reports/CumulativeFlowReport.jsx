import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';

const CumulativeFlowReport = ({ data }) => {
  const chartData = {
    labels: data.dates,
    datasets: [
      {
        label: '待办',
        data: data.backlog,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        fill: true,
      },
      {
        label: '进行中',
        data: data.inProgress,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        fill: true,
      },
      {
        label: '已完成',
        data: data.done,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        fill: true,
      }
    ]
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    plugins: {
      title: {
        display: true,
        text: '累积流图',
      },
      tooltip: {
        callbacks: {
          beforeLabel: (context) => {
            const index = context.dataIndex;
            return `日期: ${data.dates[index]}`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: '日期'
        }
      },
      y: {
        stacked: true,
        title: {
          display: true,
          text: '任务数量'
        }
      }
    }
  };

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <Line data={chartData} options={options} />
        <div className="mt-4 text-sm text-gray-600">
          <p>累积流图展示了工作项在不同状态间的流动情况，帮助识别瓶颈。</p>
        </div>
      </div>
    </div>
  );
};

export default CumulativeFlowReport;