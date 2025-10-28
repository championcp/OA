import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5003/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器 - 添加认证token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误响应
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      // 处理HTTP错误状态码
      switch (error.response.status) {
        case 401:
          // 处理未授权错误
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          // 处理禁止访问错误
          console.error('没有权限访问此资源');
          break;
        case 404:
          // 处理资源不存在错误
          console.error('请求的资源不存在');
          break;
        case 500:
          // 处理服务器内部错误
          console.error('服务器内部错误');
          break;
        default:
          console.error('请求错误:', error.response.status);
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error('没有收到服务器响应');
    } else {
      // 设置请求时发生错误
      console.error('请求设置错误:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;