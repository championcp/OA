import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { showAlert } from '../alert/alertSlice';

// 获取项目的所有Sprint
export const getSprints = createAsyncThunk(
  'sprint/getSprints',
  async (projectId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/projects/${projectId}/sprints`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response && err.response.data.msg
          ? err.response.data.msg
          : '获取Sprint列表失败'
      );
    }
  }
);

// 获取单个Sprint
export const getSprint = createAsyncThunk(
  'sprint/getSprint',
  async ({ projectId, sprintId }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/projects/${projectId}/sprints/${sprintId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response && err.response.data.msg
          ? err.response.data.msg
          : '获取Sprint详情失败'
      );
    }
  }
);

// 创建Sprint
export const createSprint = createAsyncThunk(
  'sprint/createSprint',
  async ({ projectId, sprintData }, { rejectWithValue, dispatch }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const res = await axios.post(`/api/projects/${projectId}/sprints`, sprintData, config);
      
      dispatch(showAlert('Sprint创建成功', 'success'));
      
      return res.data;
    } catch (err) {
      const errorMsg = err.response && err.response.data.msg
        ? err.response.data.msg
        : '创建Sprint失败';
        
      dispatch(showAlert(errorMsg, 'error'));
      
      return rejectWithValue(errorMsg);
    }
  }
);

// 更新Sprint
export const updateSprint = createAsyncThunk(
  'sprint/updateSprint',
  async ({ projectId, sprintId, sprintData }, { rejectWithValue, dispatch }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const res = await axios.put(
        `/api/projects/${projectId}/sprints/${sprintId}`,
        sprintData,
        config
      );
      
      dispatch(showAlert('Sprint更新成功', 'success'));
      
      return res.data;
    } catch (err) {
      const errorMsg = err.response && err.response.data.msg
        ? err.response.data.msg
        : '更新Sprint失败';
        
      dispatch(showAlert(errorMsg, 'error'));
      
      return rejectWithValue(errorMsg);
    }
  }
);

// 删除Sprint
export const deleteSprint = createAsyncThunk(
  'sprint/deleteSprint',
  async ({ projectId, sprintId }, { rejectWithValue, dispatch }) => {
    try {
      await axios.delete(`/api/projects/${projectId}/sprints/${sprintId}`);
      
      dispatch(showAlert('Sprint删除成功', 'success'));
      
      return { projectId, sprintId };
    } catch (err) {
      const errorMsg = err.response && err.response.data.msg
        ? err.response.data.msg
        : '删除Sprint失败';
        
      dispatch(showAlert(errorMsg, 'error'));
      
      return rejectWithValue(errorMsg);
    }
  }
);

// 开始Sprint
export const startSprint = createAsyncThunk(
  'sprint/startSprint',
  async ({ projectId, sprintId }, { rejectWithValue, dispatch }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const res = await axios.put(
        `/api/projects/${projectId}/sprints/${sprintId}/start`,
        {},
        config
      );
      
      dispatch(showAlert('Sprint已开始', 'success'));
      
      return res.data;
    } catch (err) {
      const errorMsg = err.response && err.response.data.msg
        ? err.response.data.msg
        : '开始Sprint失败';
        
      dispatch(showAlert(errorMsg, 'error'));
      
      return rejectWithValue(errorMsg);
    }
  }
);

// 完成Sprint
export const completeSprint = createAsyncThunk(
  'sprint/completeSprint',
  async ({ projectId, sprintId }, { rejectWithValue, dispatch }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const res = await axios.put(
        `/api/projects/${projectId}/sprints/${sprintId}/complete`,
        {},
        config
      );
      
      dispatch(showAlert('Sprint已完成', 'success'));
      
      return res.data;
    } catch (err) {
      const errorMsg = err.response && err.response.data.msg
        ? err.response.data.msg
        : '完成Sprint失败';
        
      dispatch(showAlert(errorMsg, 'error'));
      
      return rejectWithValue(errorMsg);
    }
  }
);

const initialState = {
  sprints: [],
  currentSprint: null,
  loading: false,
  error: null
};

const sprintSlice = createSlice({
  name: 'sprint',
  initialState,
  reducers: {
    clearCurrentSprint: (state) => {
      state.currentSprint = null;
    },
    clearSprintError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // 获取所有Sprint
      .addCase(getSprints.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSprints.fulfilled, (state, action) => {
        state.loading = false;
        state.sprints = action.payload;
        state.error = null;
      })
      .addCase(getSprints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 获取单个Sprint
      .addCase(getSprint.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSprint.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSprint = action.payload;
        state.error = null;
      })
      .addCase(getSprint.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 创建Sprint
      .addCase(createSprint.pending, (state) => {
        state.loading = true;
      })
      .addCase(createSprint.fulfilled, (state, action) => {
        state.loading = false;
        state.sprints.push(action.payload);
        state.error = null;
      })
      .addCase(createSprint.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 更新Sprint
      .addCase(updateSprint.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateSprint.fulfilled, (state, action) => {
        state.loading = false;
        state.sprints = state.sprints.map(sprint =>
          sprint.id === action.payload.id ? action.payload : sprint
        );
        if (state.currentSprint && state.currentSprint.id === action.payload.id) {
          state.currentSprint = action.payload;
        }
        state.error = null;
      })
      .addCase(updateSprint.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 删除Sprint
      .addCase(deleteSprint.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteSprint.fulfilled, (state, action) => {
        state.loading = false;
        state.sprints = state.sprints.filter(sprint => sprint.id !== action.payload.sprintId);
        if (state.currentSprint && state.currentSprint.id === action.payload.sprintId) {
          state.currentSprint = null;
        }
        state.error = null;
      })
      .addCase(deleteSprint.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 开始Sprint
      .addCase(startSprint.pending, (state) => {
        state.loading = true;
      })
      .addCase(startSprint.fulfilled, (state, action) => {
        state.loading = false;
        state.sprints = state.sprints.map(sprint =>
          sprint.id === action.payload.id ? action.payload : sprint
        );
        if (state.currentSprint && state.currentSprint.id === action.payload.id) {
          state.currentSprint = action.payload;
        }
        state.error = null;
      })
      .addCase(startSprint.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 完成Sprint
      .addCase(completeSprint.pending, (state) => {
        state.loading = true;
      })
      .addCase(completeSprint.fulfilled, (state, action) => {
        state.loading = false;
        state.sprints = state.sprints.map(sprint =>
          sprint.id === action.payload.id ? action.payload : sprint
        );
        if (state.currentSprint && state.currentSprint.id === action.payload.id) {
          state.currentSprint = action.payload;
        }
        state.error = null;
      })
      .addCase(completeSprint.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearCurrentSprint, clearSprintError } = sprintSlice.actions;

export default sprintSlice.reducer;