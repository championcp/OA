import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../services/api';

// 异步thunk获取项目任务
export const fetchProjectTasks = createAsyncThunk(
  'projects/fetchTasks',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/projects/${projectId}/tasks`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// 异步thunk更新任务状态
export const updateTaskStatus = createAsyncThunk(
  'projects/updateTaskStatus',
  async ({ taskId, status, order }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, { status, order });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// 异步thunk更新任务
export const updateTask = createAsyncThunk(
  'projects/updateTask',
  async ({ id, changes }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/tasks/${id}`, changes);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// 异步thunk创建任务
export const createTask = createAsyncThunk(
  'projects/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await api.post('/tasks', taskData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// 异步thunk获取任务依赖
export const fetchTaskDependencies = createAsyncThunk(
  'projects/fetchTaskDependencies',
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/tasks/${taskId}/dependencies`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// 异步thunk添加任务依赖
export const addTaskDependency = createAsyncThunk(
  'projects/addTaskDependency',
  async ({ taskId, dependencyData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/tasks/${taskId}/dependencies`, dependencyData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// 异步thunk删除任务依赖
export const removeTaskDependency = createAsyncThunk(
  'projects/removeTaskDependency',
  async ({ taskId, dependencyId }, { rejectWithValue }) => {
    try {
      await api.delete(`/tasks/${taskId}/dependencies/${dependencyId}`);
      return { taskId, dependencyId };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const projectsSlice = createSlice({
  name: 'projects',
  initialState: {
    tasks: [],
    loading: false,
    error: null
  },
  reducers: {
    // 乐观更新任务状态
    updateTaskOptimistic: (state, action) => {
      const updatedTask = action.payload;
      state.tasks = state.tasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      );
    },
    // 回滚任务状态
    revertTaskStatus: (state, action) => {
      const { taskId, originalStatus } = action.payload;
      state.tasks = state.tasks.map(task => 
        task.id === taskId ? { ...task, status: originalStatus } : task
      );
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjectTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchProjectTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || '获取任务失败';
      })
      
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        const updatedTask = action.payload;
        state.tasks = state.tasks.map(task => 
          task.id === updatedTask.id ? updatedTask : task
        );
      })
      
      .addCase(updateTask.fulfilled, (state, action) => {
        const updatedTask = action.payload;
        state.tasks = state.tasks.map(task => 
          task.id === updatedTask.id ? updatedTask : task
        );
      })
      
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.push(action.payload);
      })
      
      .addCase(fetchTaskDependencies.fulfilled, (state, action) => {
        const { taskId, dependencies } = action.payload;
        state.tasks = state.tasks.map(task => 
          task.id === taskId ? { ...task, dependencies } : task
        );
      })
      
      .addCase(addTaskDependency.fulfilled, (state, action) => {
        const { taskId, dependency } = action.payload;
        state.tasks = state.tasks.map(task => 
          task.id === taskId 
            ? { 
                ...task, 
                dependencies: [...(task.dependencies || []), dependency] 
              } 
            : task
        );
      })
      
      .addCase(removeTaskDependency.fulfilled, (state, action) => {
        const { taskId, dependencyId } = action.payload;
        state.tasks = state.tasks.map(task => 
          task.id === taskId 
            ? { 
                ...task, 
                dependencies: task.dependencies?.filter(d => d.id !== dependencyId) 
              } 
            : task
        );
      });
  }
});

export const { updateTaskOptimistic, revertTaskStatus } = projectsSlice.actions;
export default projectsSlice.reducer;