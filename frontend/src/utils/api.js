import axios from 'axios';
import { store } from '../app/store';
import { logout } from '../features/auth/authSlice';
import { showAlert } from '../features/alert/alertSlice';

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token');
    
    // 如果token存在，则添加到请求头
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { status, data } = error.response || {};
    
    // 处理401错误（未授权）
    if (status === 401) {
      store.dispatch(logout());
      store.dispatch(showAlert('会话已过期，请重新登录', 'error'));
    }
    
    // 处理500错误（服务器错误）
    if (status === 500) {
      store.dispatch(showAlert('服务器错误，请稍后再试', 'error'));
    }
    
    // 处理400错误（请求错误）
    if (status === 400) {
      const message = data.msg || '请求参数错误';
      store.dispatch(showAlert(message, 'error'));
    }
    
    return Promise.reject(error);
  }
);

export default api;