import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const TaskStatusChart = ({ tasks }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  
  useEffect(() => {
    if (!tasks || tasks.length === 0) {
      return;
    }
    
    // 如果已经有图表实例，则销毁它
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // 计算各状态的任务数量
    const statusCounts = {
      todo: tasks.filter(task => task.status === 'todo').length,
      inProgress: tasks.filter(task => task.status === 'in-progress').length,
      review: tasks.filter(task => task.status === 'review').length,
      completed: tasks.filter(task => task.status === 'completed').length
    };
    
    // 创建图表
    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['待办', '进行中', '审核中', '已完成'],
        datasets: [
          {
            data: [
              statusCounts.todo,
              statusCounts.inProgress,
              statusCounts.review,
              statusCounts.completed
            ],
            backgroundColor: [
              'rgba(255, 206, 86, 0.7)',  // 黄色 - 待办
              'rgba(54, 162, 235, 0.7)',   // 蓝色 - 进行中
              'rgba(153, 102, 255, 0.7)',  // 紫色 - 审核中
              'rgba(75, 192, 192, 0.7)'    // 绿色 - 已完成
            ],
            borderColor: [
              'rgba(255, 206, 86, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(75, 192, 192, 1)'
            ],
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
    
    // 组件卸载时清理图表
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [tasks]);
  
  return (
    <div className="w-full h-64">
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default TaskStatusChart;