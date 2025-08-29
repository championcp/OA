import React from 'react';
import { Link } from 'react-router-dom';

const DashboardCard = ({ title, value, icon, color, link }) => {
  // 根据颜色参数设置不同的样式
  const getColorClasses = (colorName) => {
    switch (colorName) {
      case 'blue':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          iconBg: 'bg-blue-200'
        };
      case 'green':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          iconBg: 'bg-green-200'
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          iconBg: 'bg-yellow-200'
        };
      case 'orange':
        return {
          bg: 'bg-orange-100',
          text: 'text-orange-800',
          iconBg: 'bg-orange-200'
        };
      case 'red':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          iconBg: 'bg-red-200'
        };
      case 'purple':
        return {
          bg: 'bg-purple-100',
          text: 'text-purple-800',
          iconBg: 'bg-purple-200'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          iconBg: 'bg-gray-200'
        };
    }
  };
  
  // 根据图标类型返回不同的SVG图标
  const getIcon = (iconType) => {
    switch (iconType) {
      case 'project':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path>
          </svg>
        );
      case 'task':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"></path>
          </svg>
        );
      case 'progress':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 2a6 6 0 016 6h-3a3 3 0 00-3-3V4z"></path>
          </svg>
        );
      case 'completed':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
          </svg>
        );
      case 'user':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
          </svg>
        );
      case 'bug':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M6.56 1.14a.75.75 0 01.177 1.045 3.989 3.989 0 00-.464.69c.145.118.257.244.389.386l.464.485c.182.19.37.381.559.571.212.212.445.405.668.609a43.57 43.57 0 011.394 1.312c.165.17.334.34.501.516.99 1.037 1.996 2.096 3.01 3.148.317.33.643.649.968.978.216.217.431.434.648.651l.149.148c.654.654 1.315 1.3 1.985 1.94l.333.324.647-.647a.75.75 0 011.06 0l2 2a.75.75 0 010 1.06l-.647.647.217.218a.75.75 0 01-1.06 1.06l-2-2a.75.75 0 010-1.06l.647-.647-.333-.324c-.67-.639-1.33-1.285-1.985-1.939l-.148-.148a51.03 51.03 0 01-.649-.652 57.627 57.627 0 01-.968-.978c-1.014-1.052-2.019-2.11-3.01-3.148-.166-.174-.334-.346-.5-.516a44.278 44.278 0 00-1.394-1.312 41.377 41.377 0 01-.668-.609 22.43 22.43 0 01-.56-.571l-.463-.485c-.132-.142-.244-.268-.39-.386a5.12 5.12 0 01-.401-.425A5.058 5.058 0 006.5 3.5 5.001 5.001 0 001.5 8.5v9a.75.75 0 01-1.5 0v-9A6.5 6.5 0 016.5 2a6.56 6.56 0 011.177.11l.06.01z" clipRule="evenodd"></path>
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"></path>
          </svg>
        );
    }
  };
  
  const colorClasses = getColorClasses(color);
  
  const cardContent = (
    <div className={`${colorClasses.bg} rounded-lg shadow p-6 hover:shadow-md transition-shadow`}>
      <div className="flex items-center">
        <div className={`${colorClasses.iconBg} ${colorClasses.text} p-3 rounded-full mr-4`}>
          {getIcon(icon)}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <p className={`text-2xl font-bold ${colorClasses.text}`}>{value}</p>
        </div>
      </div>
    </div>
  );
  
  // 如果提供了链接，则包装在Link组件中
  if (link) {
    return <Link to={link}>{cardContent}</Link>;
  }
  
  // 否则直接返回卡片内容
  return cardContent;
};

export default DashboardCard;