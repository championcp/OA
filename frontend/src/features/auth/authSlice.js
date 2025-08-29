import { createSlice } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  status: 'idle',
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      localStorage.setItem('token', token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

// 登录异步操作
export const login = (credentials) => async (dispatch) => {
  try {
    const response = await api.post('/auth/login', credentials);
    const { user, token } = response.data;
    dispatch(setCredentials({ user, token }));
    return { user, token };
  } catch (error) {
    throw error.response.data;
  }
};

// 注册异步操作
export const register = (userData) => async (dispatch) => {
  try {
    const response = await api.post('/auth/register', userData);
    const { user, token } = response.data;
    dispatch(setCredentials({ user, token }));
    return { user, token };
  } catch (error) {
    throw error.response.data;
  }
};

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;