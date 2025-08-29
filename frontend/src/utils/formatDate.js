// 格式化日期为 YYYY-MM-DD 格式
export const formatDate = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

// 格式化日期为本地日期时间格式
export const formatDateTime = (date) => {
  return new Date(date).toLocaleString();
};

// 计算两个日期之间的天数差
export const daysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// 计算剩余天数
export const daysRemaining = (endDate) => {
  const today = new Date();
  const end = new Date(endDate);
  const diffTime = end - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};