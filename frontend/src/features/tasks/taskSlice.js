import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { showAlert } from '../alert/alertSlice';

// 获取Sprint的所有任务
export const getTasksBySprint = createAsyncThunk(
  'task/getTasksBySprint',
  async ({ projectId, sprintId }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/projects/${projectId}/sprints/${sprintId}/tasks`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response && err.response.data.msg
          ? err.response.data.msg
          : '获取任务列表失败'
      );
    }
  }
);

// 获取用户故事的所有任务
export const getTasksByStory = createAsyncThunk(
  'task/getTasksByStory',
  async ({ projectId, storyId }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/projects/${projectId}/stories/${storyId}/tasks`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response && err.response.data.msg
          ? err.response.data.msg
          : '获取任务列表失败'
      );
    }
  }
);

// 获取单个任务
export const getTask = createAsyncThunk(
  'task/getTask',
  async ({ projectId, taskId }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/projects/${projectId}/tasks/${taskId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response && err.response.data.msg
          ? err.response.data.msg
          : '获取任务详情失败'
      );
    }
  }
);

// 创建任务
export const createTask = createAsyncThunk(
  'task/createTask',
  async ({ projectId, sprintId, storyId, taskData }, { rejectWithValue, dispatch }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      // 构建请求路径
      let url = `/api/projects/${projectId}/tasks`;
      if (sprintId) {
        url = `/api/projects/${projectId}/sprints/${sprintId}/tasks`;
      } else if (storyId) {
        url = `/api/projects/${projectId}/stories/${storyId}/tasks`;
      }

      const res = await axios.post(url, taskData, config);
      
      dispatch(showAlert('任务创建成功', 'success'));
      
      return res.data;
    } catch (err) {
      const errorMsg = err.response && err.response.data.msg
        ? err.response.data.msg
        : '创建任务失败';
        
      dispatch(showAlert(errorMsg, 'error'));
      
      return rejectWithValue(errorMsg);
    }
  }
);

// 更新任务
export const updateTask = createAsyncThunk(
  'task/updateTask',
  async ({ projectId, taskId, taskData }, { rejectWithValue, dispatch }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const res = await axios.put(
        `/api/projects/${projectId}/tasks/${taskId}`,
        taskData,
        config
      );
      
      dispatch(showAlert('任务更新成功', 'success'));
      
      return res.data;
    } catch (err) {
      const errorMsg = err.response && err.response.data.msg
        ? err.response.data.msg
        : '更新任务失败';
        
      dispatch(showAlert(errorMsg, 'error'));
      
      return rejectWithValue(errorMsg);
    }
  }
);

// 删除任务
export const deleteTask = createAsyncThunk(
  'task/deleteTask',
  async ({ projectId, taskId }, { rejectWithValue, dispatch }) => {
    try {
      await axios.delete(`/api/projects/${projectId}/tasks/${taskId}`);
      
      dispatch(showAlert('任务删除成功', 'success'));
      
      return { projectId, taskId };
    } catch (err) {
      const errorMsg = err.response && err.response.data.msg
        ? err.response.data.msg
        : '删除任务失败';
        
      dispatch(showAlert(errorMsg, 'error'));
      
      return rejectWithValue(errorMsg);
    }
  }
);

// 更新任务状态
export const updateTaskStatus = createAsyncThunk(
  'task/updateTaskStatus',
  async ({ projectId, taskId, status }, { rejectWithValue, dispatch }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const res = await axios.put(
        `/api/projects/${projectId}/tasks/${taskId}/status`,
        { status },
        config
      );
      
      dispatch(showAlert('任务状态更新成功', 'success'));
      
      return res.data;
    } catch (err) {
      const errorMsg = err.response && err.response.data.msg
        ? err.response.data.msg
        : '更新任务状态失败';
        
      dispatch(showAlert(errorMsg, 'error'));
      
      return rejectWithValue(errorMsg);
    }
  }
);

// 分配任务
export const assignTask = createAsyncThunk(
  'task/assignTask',
  async ({ projectId, taskId, userId }, { rejectWithValue, dispatch }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const res = await axios.put(
        `/api/projects/${projectId}/tasks/${taskId}/assign`,
        { assignee_id: userId },
        config
      );
      
      dispatch(showAlert('任务分配成功', 'success'));
      
      return res.data;
    } catch (err) {
      const errorMsg = err.response && err.response.data.msg
        ? err.response.data.msg
        : '分配任务失败';
        
      dispatch(showAlert(errorMsg, 'error'));
      
      return rejectWithValue(errorMsg);
    }
  }
);

const initialState = {
  tasks: [],
  currentTask: null,
  loading: false,
  error: null
};

const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    clearCurrentTask: (state) => {
      state.currentTask = null;
    },
    clearTaskError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // 获取Sprint的所有任务
      .addCase(getTasksBySprint.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTasksBySprint.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
        state.error = null;
      })
      .addCase(getTasksBySprint.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 获取用户故事的所有任务
      .addCase(getTasksByStory.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTasksByStory.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
        state.error = null;
      })
      .addCase(getTasksByStory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 获取单个任务
      .addCase(getTask.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTask.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTask = action.payload;
        state.error = null;
      })
      .addCase(getTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 创建任务
      .addCase(createTask.pending, (state) => {
        state.loading = true;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.push(action.payload);
        state.error = null;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 更新任务
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        );
        if (state.currentTask && state.currentTask.id === action.payload.id) {
          state.currentTask = action.payload;
        }
        state.error = null;
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 删除任务
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.filter(task => task.id !== action.payload.taskId);
        if (state.currentTask && state.currentTask.id === action.payload.taskId) {
          state.currentTask = null;
        }
        state.error = null;
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 更新任务状态
      .addCase(updateTaskStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        );
        if (state.currentTask && state.currentTask.id === action.payload.id) {
          state.currentTask = action.payload;
        }
        state.error = null;
      })
      .addCase(updateTaskStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 分配任务
      .addCase(assignTask.pending, (state) => {
        state.loading = true;
      })
      .addCase(assignTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        );
        if (state.currentTask && state.currentTask.id === action.payload.id) {
          state.currentTask = action.payload;
        }
        state.error = null;
      })
      .addCase(assignTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearCurrentTask, clearTaskError } = taskSlice.actions;

export default taskSlice.reducer;