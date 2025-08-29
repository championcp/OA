import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

const initialState = [];

const alertSlice = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    setAlert: {
      reducer: (state, action) => {
        state.push(action.payload);
      },
      prepare: (msg, type, timeout = 5000) => {
        const id = uuidv4();
        return {
          payload: {
            id,
            msg,
            type
          },
          meta: {
            timeout,
            id
          }
        };
      }
    },
    removeAlert: (state, action) => {
      return state.filter(alert => alert.id !== action.payload);
    }
  }
});

export const { setAlert, removeAlert } = alertSlice.actions;

// 创建一个异步的alert action creator
export const showAlert = (msg, type, timeout = 5000) => dispatch => {
  const action = setAlert(msg, type, timeout);
  dispatch(action);
  
  // 设置定时器移除alert
  setTimeout(() => {
    dispatch(removeAlert(action.payload.id));
  }, timeout);
};

export default alertSlice.reducer;