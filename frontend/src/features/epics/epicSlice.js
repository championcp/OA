import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { showAlert } from '../alert/alertSlice';

// 获取项目的所有史诗
export const getEpics = createAsyncThunk(
  'epic/getEpics',
  async (projectId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/projects/${projectId}/epics`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response && err.response.data.msg
          ? err.response.data.msg
          : '获取史诗列表失败'
      );
    }
  }
);

// 获取单个史诗
export const getEpic = createAsyncThunk(
  'epic/getEpic',
  async ({ projectId, epicId }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/projects/${projectId}/epics/${epicId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response && err.response.data.msg
          ? err.response.data.msg
          : '获取史诗详情失败'
      );
    }
  }
);

// 创建史诗
export const createEpic = createAsyncThunk(
  'epic/createEpic',
  async ({ projectId, epicData }, { rejectWithValue, dispatch }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const res = await axios.post(`/api/projects/${projectId}/epics`, epicData, config);
      
      dispatch(showAlert('史诗创建成功', 'success'));
      
      return res.data;
    } catch (err) {
      const errorMsg = err.response && err.response.data.msg
        ? err.response.data.msg
        : '创建史诗失败';
        
      dispatch(showAlert(errorMsg, 'error'));
      
      return rejectWithValue(errorMsg);
    }
  }
);

// 更新史诗
export const updateEpic = createAsyncThunk(
  'epic/updateEpic',
  async ({ projectId, epicId, epicData }, { rejectWithValue, dispatch }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const res = await axios.put(
        `/api/projects/${projectId}/epics/${epicId}`,
        epicData,
        config
      );
      
      dispatch(showAlert('史诗更新成功', 'success'));
      
      return res.data;
    } catch (err) {
      const errorMsg = err.response && err.response.data.msg
        ? err.response.data.msg
        : '更新史诗失败';
        
      dispatch(showAlert(errorMsg, 'error'));
      
      return rejectWithValue(errorMsg);
    }
  }
);

// 删除史诗
export const deleteEpic = createAsyncThunk(
  'epic/deleteEpic',
  async ({ projectId, epicId }, { rejectWithValue, dispatch }) => {
    try {
      await axios.delete(`/api/projects/${projectId}/epics/${epicId}`);
      
      dispatch(showAlert('史诗删除成功', 'success'));
      
      return { projectId, epicId };
    } catch (err) {
      const errorMsg = err.response && err.response.data.msg
        ? err.response.data.msg
        : '删除史诗失败';
        
      dispatch(showAlert(errorMsg, 'error'));
      
      return rejectWithValue(errorMsg);
    }
  }
);

// 更新史诗状态
export const updateEpicStatus = createAsyncThunk(
  'epic/updateEpicStatus',
  async ({ projectId, epicId, status }, { rejectWithValue, dispatch }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const res = await axios.put(
        `/api/projects/${projectId}/epics/${epicId}/status`,
        { status },
        config
      );
      
      dispatch(showAlert('史诗状态更新成功', 'success'));
      
      return res.data;
    } catch (err) {
      const errorMsg = err.response && err.response.data.msg
        ? err.response.data.msg
        : '更新史诗状态失败';
        
      dispatch(showAlert(errorMsg, 'error'));
      
      return rejectWithValue(errorMsg);
    }
  }
);

const initialState = {
  epics: [],
  currentEpic: null,
  loading: false,
  error: null
};

const epicSlice = createSlice({
  name: 'epic',
  initialState,
  reducers: {
    clearCurrentEpic: (state) => {
      state.currentEpic = null;
    },
    clearEpicError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // 获取项目的所有史诗
      .addCase(getEpics.pending, (state) => {
        state.loading = true;
      })
      .addCase(getEpics.fulfilled, (state, action) => {
        state.loading = false;
        state.epics = action.payload;
        state.error = null;
      })
      .addCase(getEpics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 获取单个史诗
      .addCase(getEpic.pending, (state) => {
        state.loading = true;
      })
      .addCase(getEpic.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEpic = action.payload;
        state.error = null;
      })
      .addCase(getEpic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 创建史诗
      .addCase(createEpic.pending, (state) => {
        state.loading = true;
      })
      .addCase(createEpic.fulfilled, (state, action) => {
        state.loading = false;
        state.epics.push(action.payload);
        state.error = null;
      })
      .addCase(createEpic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 更新史诗
      .addCase(updateEpic.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateEpic.fulfilled, (state, action) => {
        state.loading = false;
        state.epics = state.epics.map(epic =>
          epic.id === action.payload.id ? action.payload : epic
        );
        if (state.currentEpic && state.currentEpic.id === action.payload.id) {
          state.currentEpic = action.payload;
        }
        state.error = null;
      })
      .addCase(updateEpic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 删除史诗
      .addCase(deleteEpic.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteEpic.fulfilled, (state, action) => {
        state.loading = false;
        state.epics = state.epics.filter(epic => epic.id !== action.payload.epicId);
        if (state.currentEpic && state.currentEpic.id === action.payload.epicId) {
          state.currentEpic = null;
        }
        state.error = null;
      })
      .addCase(deleteEpic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 更新史诗状态
      .addCase(updateEpicStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateEpicStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.epics = state.epics.map(epic =>
          epic.id === action.payload.id ? action.payload : epic
        );
        if (state.currentEpic && state.currentEpic.id === action.payload.id) {
          state.currentEpic = action.payload;
        }
        state.error = null;
      })
      .addCase(updateEpicStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearCurrentEpic, clearEpicError } = epicSlice.actions;

export default epicSlice.reducer;