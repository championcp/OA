import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';

const BurnDownReport = ({ data }) => {
  const chartData = {
    labels: data.days,
    datasets: [
      {
        label: '剩余工作',
        data: data.remainingWork,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: '理想燃尽线',
        data: data.idealBurnDown,
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderDash: [5, 5],
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: '迭代燃尽图',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: '剩余工作量'
        }
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

export default BurnDownReport;