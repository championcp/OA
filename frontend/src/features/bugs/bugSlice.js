import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { showAlert } from '../alert/alertSlice';

// 获取项目的所有缺陷
export const getBugs = createAsyncThunk(
  'bug/getBugs',
  async (projectId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/projects/${projectId}/bugs`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response && err.response.data.msg
          ? err.response.data.msg
          : '获取缺陷列表失败'
      );
    }
  }
);

// 获取Sprint的所有缺陷
export const getBugsBySprint = createAsyncThunk(
  'bug/getBugsBySprint',
  async ({ projectId, sprintId }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/projects/${projectId}/sprints/${sprintId}/bugs`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response && err.response.data.msg
          ? err.response.data.msg
          : '获取缺陷列表失败'
      );
    }
  }
);

// 获取单个缺陷
export const getBug = createAsyncThunk(
  'bug/getBug',
  async ({ projectId, bugId }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/projects/${projectId}/bugs/${bugId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response && err.response.data.msg
          ? err.response.data.msg
          : '获取缺陷详情失败'
      );
    }
  }
);

// 创建缺陷
export const createBug = createAsyncThunk(
  'bug/createBug',
  async ({ projectId, bugData }, { rejectWithValue, dispatch }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const res = await axios.post(`/api/projects/${projectId}/bugs`, bugData, config);
      
      dispatch(showAlert('缺陷创建成功', 'success'));
      
      return res.data;
    } catch (err) {
      const errorMsg = err.response && err.response.data.msg
        ? err.response.data.msg
        : '创建缺陷失败';
        
      dispatch(showAlert(errorMsg, 'error'));
      
      return rejectWithValue(errorMsg);
    }
  }
);

// 更新缺陷
export const updateBug = createAsyncThunk(
  'bug/updateBug',
  async ({ projectId, bugId, bugData }, { rejectWithValue, dispatch }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const res = await axios.put(
        `/api/projects/${projectId}/bugs/${bugId}`,
        bugData,
        config
      );
      
      dispatch(showAlert('缺陷更新成功', 'success'));
      
      return res.data;
    } catch (err) {
      const errorMsg = err.response && err.response.data.msg
        ? err.response.data.msg
        : '更新缺陷失败';
        
      dispatch(showAlert(errorMsg, 'error'));
      
      return rejectWithValue(errorMsg);
    }
  }
);

// 删除缺陷
export const deleteBug = createAsyncThunk(
  'bug/deleteBug',
  async ({ projectId, bugId }, { rejectWithValue, dispatch }) => {
    try {
      await axios.delete(`/api/projects/${projectId}/bugs/${bugId}`);
      
      dispatch(showAlert('缺陷删除成功', 'success'));
      
      return { projectId, bugId };
    } catch (err) {
      const errorMsg = err.response && err.response.data.msg
        ? err.response.data.msg
        : '删除缺陷失败';
        
      dispatch(showAlert(errorMsg, 'error'));
      
      return rejectWithValue(errorMsg);
    }
  }
);

// 更新缺陷状态
export const updateBugStatus = createAsyncThunk(
  'bug/updateBugStatus',
  async ({ projectId, bugId, status }, { rejectWithValue, dispatch }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const res = await axios.put(
        `/api/projects/${projectId}/bugs/${bugId}/status`,
        { status },
        config
      );
      
      dispatch(showAlert('缺陷状态更新成功', 'success'));
      
      return res.data;
    } catch (err) {
      const errorMsg = err.response && err.response.data.msg
        ? err.response.data.msg
        : '更新缺陷状态失败';
        
      dispatch(showAlert(errorMsg, 'error'));
      
      return rejectWithValue(errorMsg);
    }
  }
);

// 分配缺陷
export const assignBug = createAsyncThunk(
  'bug/assignBug',
  async ({ projectId, bugId, userId }, { rejectWithValue, dispatch }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const res = await axios.put(
        `/api/projects/${projectId}/bugs/${bugId}/assign`,
        { assignee_id: userId },
        config
      );
      
      dispatch(showAlert('缺陷分配成功', 'success'));
      
      return res.data;
    } catch (err) {
      const errorMsg = err.response && err.response.data.msg
        ? err.response.data.msg
        : '分配缺陷失败';
        
      dispatch(showAlert(errorMsg, 'error'));
      
      return rejectWithValue(errorMsg);
    }
  }
);

// 添加缺陷评论
export const addBugComment = createAsyncThunk(
  'bug/addBugComment',
  async ({ projectId, bugId, content }, { rejectWithValue, dispatch }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const res = await axios.post(
        `/api/projects/${projectId}/bugs/${bugId}/comments`,
        { content },
        config
      );
      
      dispatch(showAlert('评论添加成功', 'success'));
      
      return res.data;
    } catch (err) {
      const errorMsg = err.response && err.response.data.msg
        ? err.response.data.msg
        : '添加评论失败';
        
      dispatch(showAlert(errorMsg, 'error'));
      
      return rejectWithValue(errorMsg);
    }
  }
);

const initialState = {
  bugs: [],
  currentBug: null,
  loading: false,
  error: null
};

const bugSlice = createSlice({
  name: 'bug',
  initialState,
  reducers: {
    clearCurrentBug: (state) => {
      state.currentBug = null;
    },
    clearBugError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // 获取项目的所有缺陷
      .addCase(getBugs.pending, (state) => {
        state.loading = true;
      })
      .addCase(getBugs.fulfilled, (state, action) => {
        state.loading = false;
        state.bugs = action.payload;
        state.error = null;
      })
      .addCase(getBugs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 获取Sprint的所有缺陷
      .addCase(getBugsBySprint.pending, (state) => {
        state.loading = true;
      })
      .addCase(getBugsBySprint.fulfilled, (state, action) => {
        state.loading = false;
        state.bugs = action.payload;
        state.error = null;
      })
      .addCase(getBugsBySprint.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 获取单个缺陷
      .addCase(getBug.pending, (state) => {
        state.loading = true;
      })
      .addCase(getBug.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBug = action.payload;
        state.error = null;
      })
      .addCase(getBug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 创建缺陷
      .addCase(createBug.pending, (state) => {
        state.loading = true;
      })
      .addCase(createBug.fulfilled, (state, action) => {
        state.loading = false;
        state.bugs.push(action.payload);
        state.error = null;
      })
      .addCase(createBug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 更新缺陷
      .addCase(updateBug.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateBug.fulfilled, (state, action) => {
        state.loading = false;
        state.bugs = state.bugs.map(bug =>
          bug.id === action.payload.id ? action.payload : bug
        );
        if (state.currentBug && state.currentBug.id === action.payload.id) {
          state.currentBug = action.payload;
        }
        state.error = null;
      })
      .addCase(updateBug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 删除缺陷
      .addCase(deleteBug.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteBug.fulfilled, (state, action) => {
        state.loading = false;
        state.bugs = state.bugs.filter(bug => bug.id !== action.payload.bugId);
        if (state.currentBug && state.currentBug.id === action.payload.bugId) {
          state.currentBug = null;
        }
        state.error = null;
      })
      .addCase(deleteBug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 更新缺陷状态
      .addCase(updateBugStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateBugStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.bugs = state.bugs.map(bug =>
          bug.id === action.payload.id ? action.payload : bug
        );
        if (state.currentBug && state.currentBug.id === action.payload.id) {
          state.currentBug = action.payload;
        }
        state.error = null;
      })
      .addCase(updateBugStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 分配缺陷
      .addCase(assignBug.pending, (state) => {
        state.loading = true;
      })
      .addCase(assignBug.fulfilled, (state, action) => {
        state.loading = false;
        state.bugs = state.bugs.map(bug =>
          bug.id === action.payload.id ? action.payload : bug
        );
        if (state.currentBug && state.currentBug.id === action.payload.id) {
          state.currentBug = action.payload;
        }
        state.error = null;
      })
      .addCase(assignBug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 添加缺陷评论
      .addCase(addBugComment.pending, (state) => {
        state.loading = true;
      })
      .addCase(addBugComment.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentBug) {
          if (!state.currentBug.comments) {
            state.currentBug.comments = [];
          }
          state.currentBug.comments.push(action.payload);
        }
        state.error = null;
      })
      .addCase(addBugComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearCurrentBug, clearBugError } = bugSlice.actions;

export default bugSlice.reducer;