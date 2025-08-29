import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import Chart from 'chart.js/auto';

const BurndownChart = ({ sprintId }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  
  const { currentSprint } = useSelector((state) => state.sprint);
  const { tasks } = useSelector((state) => state.task);
  
  useEffect(() => {
    // 如果没有指定sprint或者没有当前sprint，则不渲染图表
    if (!sprintId && !currentSprint) {
      return;
    }
    
    const sprint = sprintId ? 
      { id: sprintId } : // 后续会通过API获取具体sprint数据
      currentSprint;
    
    // 如果已经有图表实例，则销毁它
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // 准备图表数据
    const sprintTasks = tasks.filter(task => task.sprintId === sprint.id);
    
    // 计算理想燃尽线
    const startDate = new Date(sprint.startDate);
    const endDate = new Date(sprint.endDate);
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const totalPoints = sprintTasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0);
    
    const labels = [];
    const idealData = [];
    const actualData = [];
    
    // 生成日期标签和理想燃尽线数据
    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      labels.push(currentDate.toLocaleDateString());
      idealData.push(totalPoints - (totalPoints / (totalDays - 1)) * i);
      
      // 模拟实际燃尽线数据（实际项目中应从API获取）
      // 这里使用一个简单的模拟，实际项目中应该从后端获取每天的剩余点数
      const randomFactor = Math.random() * 0.2 - 0.1; // -10% 到 +10% 的随机偏差
      const actualValue = idealData[i] * (1 + randomFactor);
      actualData.push(Math.max(0, actualValue));
    }
    
    // 创建图表
    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: '理想燃尽线',
            data: idealData,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 2,
            pointRadius: 3,
            tension: 0.1
          },
          {
            label: '实际燃尽线',
            data: actualData,
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderWidth: 2,
            pointRadius: 3,
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: '剩余故事点数'
            }
          },
          x: {
            title: {
              display: true,
              text: '日期'
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: '迭代燃尽图'
          },
          tooltip: {
            mode: 'index',
            intersect: false
          },
          legend: {
            position: 'bottom'
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
  }, [sprintId, currentSprint, tasks]);
  
  return (
    <div className="w-full h-64">
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default BurndownChart;