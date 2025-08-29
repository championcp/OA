import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { showAlert } from '../alert/alertSlice';

// 获取项目的所有版本
export const getReleases = createAsyncThunk(
  'release/getReleases',
  async (projectId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/projects/${projectId}/releases`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response && err.response.data.msg
          ? err.response.data.msg
          : '获取版本列表失败'
      );
    }
  }
);

// 获取单个版本
export const getRelease = createAsyncThunk(
  'release/getRelease',
  async ({ projectId, releaseId }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/projects/${projectId}/releases/${releaseId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response && err.response.data.msg
          ? err.response.data.msg
          : '获取版本详情失败'
      );
    }
  }
);

// 创建版本
export const createRelease = createAsyncThunk(
  'release/createRelease',
  async ({ projectId, releaseData }, { rejectWithValue, dispatch }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const res = await axios.post(`/api/projects/${projectId}/releases`, releaseData, config);
      
      dispatch(showAlert('版本创建成功', 'success'));
      
      return res.data;
    } catch (err) {
      const errorMsg = err.response && err.response.data.msg
        ? err.response.data.msg
        : '创建版本失败';
        
      dispatch(showAlert(errorMsg, 'error'));
      
      return rejectWithValue(errorMsg);
    }
  }
);

// 更新版本
export const updateRelease = createAsyncThunk(
  'release/updateRelease',
  async ({ projectId, releaseId, releaseData }, { rejectWithValue, dispatch }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const res = await axios.put(
        `/api/projects/${projectId}/releases/${releaseId}`,
        releaseData,
        config
      );
      
      dispatch(showAlert('版本更新成功', 'success'));
      
      return res.data;
    } catch (err) {
      const errorMsg = err.response && err.response.data.msg
        ? err.response.data.msg
        : '更新版本失败';
        
      dispatch(showAlert(errorMsg, 'error'));
      
      return rejectWithValue(errorMsg);
    }
  }
);

// 删除版本
export const deleteRelease = createAsyncThunk(
  'release/deleteRelease',
  async ({ projectId, releaseId }, { rejectWithValue, dispatch }) => {
    try {
      await axios.delete(`/api/projects/${projectId}/releases/${releaseId}`);
      
      dispatch(showAlert('版本删除成功', 'success'));
      
      return { projectId, releaseId };
    } catch (err) {
      const errorMsg = err.response && err.response.data.msg
        ? err.response.data.msg
        : '删除版本失败';
        
      dispatch(showAlert(errorMsg, 'error'));
      
      return rejectWithValue(errorMsg);
    }
  }
);

// 更新版本状态
export const updateReleaseStatus = createAsyncThunk(
  'release/updateReleaseStatus',
  async ({ projectId, releaseId, status }, { rejectWithValue, dispatch }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const res = await axios.put(
        `/api/projects/${projectId}/releases/${releaseId}/status`,
        { status },
        config
      );
      
      dispatch(showAlert('版本状态更新成功', 'success'));
      
      return res.data;
    } catch (err) {
      const errorMsg = err.response && err.response.data.msg
        ? err.response.data.msg
        : '更新版本状态失败';
        
      dispatch(showAlert(errorMsg, 'error'));
      
      return rejectWithValue(errorMsg);
    }
  }
);

// 添加版本说明
export const addReleaseNote = createAsyncThunk(
  'release/addReleaseNote',
  async ({ projectId, releaseId, note }, { rejectWithValue, dispatch }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const res = await axios.post(
        `/api/projects/${projectId}/releases/${releaseId}/notes`,
        { content: note },
        config
      );
      
      dispatch(showAlert('版本说明添加成功', 'success'));
      
      return res.data;
    } catch (err) {
      const errorMsg = err.response && err.response.data.msg
        ? err.response.data.msg
        : '添加版本说明失败';
        
      dispatch(showAlert(errorMsg, 'error'));
      
      return rejectWithValue(errorMsg);
    }
  }
);

const initialState = {
  releases: [],
  currentRelease: null,
  loading: false,
  error: null
};

const releaseSlice = createSlice({
  name: 'release',
  initialState,
  reducers: {
    clearCurrentRelease: (state) => {
      state.currentRelease = null;
    },
    clearReleaseError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // 获取项目的所有版本
      .addCase(getReleases.pending, (state) => {
        state.loading = true;
      })
      .addCase(getReleases.fulfilled, (state, action) => {
        state.loading = false;
        state.releases = action.payload;
        state.error = null;
      })
      .addCase(getReleases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 获取单个版本
      .addCase(getRelease.pending, (state) => {
        state.loading = true;
      })
      .addCase(getRelease.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRelease = action.payload;
        state.error = null;
      })
      .addCase(getRelease.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 创建版本
      .addCase(createRelease.pending, (state) => {
        state.loading = true;
      })
      .addCase(createRelease.fulfilled, (state, action) => {
        state.loading = false;
        state.releases.push(action.payload);
        state.error = null;
      })
      .addCase(createRelease.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 更新版本
      .addCase(updateRelease.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateRelease.fulfilled, (state, action) => {
        state.loading = false;
        state.releases = state.releases.map(release =>
          release.id === action.payload.id ? action.payload : release
        );
        if (state.currentRelease && state.currentRelease.id === action.payload.id) {
          state.currentRelease = action.payload;
        }
        state.error = null;
      })
      .addCase(updateRelease.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 删除版本
      .addCase(deleteRelease.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteRelease.fulfilled, (state, action) => {
        state.loading = false;
        state.releases = state.releases.filter(release => release.id !== action.payload.releaseId);
        if (state.currentRelease && state.currentRelease.id === action.payload.releaseId) {
          state.currentRelease = null;
        }
        state.error = null;
      })
      .addCase(deleteRelease.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 更新版本状态
      .addCase(updateReleaseStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateReleaseStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.releases = state.releases.map(release =>
          release.id === action.payload.id ? action.payload : release
        );
        if (state.currentRelease && state.currentRelease.id === action.payload.id) {
          state.currentRelease = action.payload;
        }
        state.error = null;
      })
      .addCase(updateReleaseStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 添加版本说明
      .addCase(addReleaseNote.pending, (state) => {
        state.loading = true;
      })
      .addCase(addReleaseNote.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentRelease) {
          if (!state.currentRelease.notes) {
            state.currentRelease.notes = [];
          }
          state.currentRelease.notes.push(action.payload);
        }
        state.error = null;
      })
      .addCase(addReleaseNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearCurrentRelease, clearReleaseError } = releaseSlice.actions;

export default releaseSlice.reducer;