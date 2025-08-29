import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { showAlert } from '../alert/alertSlice';

// 获取项目的所有用户故事
export const getStories = createAsyncThunk(
  'story/getStories',
  async (projectId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/projects/${projectId}/stories`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response && err.response.data.msg
          ? err.response.data.msg
          : '获取用户故事列表失败'
      );
    }
  }
);

// 获取Sprint的所有用户故事
export const getStoriesBySprint = createAsyncThunk(
  'story/getStoriesBySprint',
  async ({ projectId, sprintId }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/projects/${projectId}/sprints/${sprintId}/stories`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response && err.response.data.msg
          ? err.response.data.msg
          : '获取用户故事列表失败'
      );
    }
  }
);

// 获取Epic的所有用户故事
export const getStoriesByEpic = createAsyncThunk(
  'story/getStoriesByEpic',
  async ({ projectId, epicId }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/projects/${projectId}/epics/${epicId}/stories`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response && err.response.data.msg
          ? err.response.data.msg
          : '获取用户故事列表失败'
      );
    }
  }
);

// 获取单个用户故事
export const getStory = createAsyncThunk(
  'story/getStory',
  async ({ projectId, storyId }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/projects/${projectId}/stories/${storyId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response && err.response.data.msg
          ? err.response.data.msg
          : '获取用户故事详情失败'
      );
    }
  }
);

// 创建用户故事
export const createStory = createAsyncThunk(
  'story/createStory',
  async ({ projectId, storyData }, { rejectWithValue, dispatch }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const res = await axios.post(`/api/projects/${projectId}/stories`, storyData, config);
      
      dispatch(showAlert('用户故事创建成功', 'success'));
      
      return res.data;
    } catch (err) {
      const errorMsg = err.response && err.response.data.msg
        ? err.response.data.msg
        : '创建用户故事失败';
        
      dispatch(showAlert(errorMsg, 'error'));
      
      return rejectWithValue(errorMsg);
    }
  }
);

// 更新用户故事
export const updateStory = createAsyncThunk(
  'story/updateStory',
  async ({ projectId, storyId, storyData }, { rejectWithValue, dispatch }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const res = await axios.put(
        `/api/projects/${projectId}/stories/${storyId}`,
        storyData,
        config
      );
      
      dispatch(showAlert('用户故事更新成功', 'success'));
      
      return res.data;
    } catch (err) {
      const errorMsg = err.response && err.response.data.msg
        ? err.response.data.msg
        : '更新用户故事失败';
        
      dispatch(showAlert(errorMsg, 'error'));
      
      return rejectWithValue(errorMsg);
    }
  }
);

// 删除用户故事
export const deleteStory = createAsyncThunk(
  'story/deleteStory',
  async ({ projectId, storyId }, { rejectWithValue, dispatch }) => {
    try {
      await axios.delete(`/api/projects/${projectId}/stories/${storyId}`);
      
      dispatch(showAlert('用户故事删除成功', 'success'));
      
      return { projectId, storyId };
    } catch (err) {
      const errorMsg = err.response && err.response.data.msg
        ? err.response.data.msg
        : '删除用户故事失败';
        
      dispatch(showAlert(errorMsg, 'error'));
      
      return rejectWithValue(errorMsg);
    }
  }
);

// 更新用户故事状态
export const updateStoryStatus = createAsyncThunk(
  'story/updateStoryStatus',
  async ({ projectId, storyId, status }, { rejectWithValue, dispatch }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const res = await axios.put(
        `/api/projects/${projectId}/stories/${storyId}/status`,
        { status },
        config
      );
      
      dispatch(showAlert('用户故事状态更新成功', 'success'));
      
      return res.data;
    } catch (err) {
      const errorMsg = err.response && err.response.data.msg
        ? err.response.data.msg
        : '更新用户故事状态失败';
        
      dispatch(showAlert(errorMsg, 'error'));
      
      return rejectWithValue(errorMsg);
    }
  }
);

// 将用户故事添加到Sprint
export const addStoryToSprint = createAsyncThunk(
  'story/addStoryToSprint',
  async ({ projectId, storyId, sprintId }, { rejectWithValue, dispatch }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const res = await axios.put(
        `/api/projects/${projectId}/stories/${storyId}/sprint`,
        { sprint_id: sprintId },
        config
      );
      
      dispatch(showAlert('用户故事已添加到Sprint', 'success'));
      
      return res.data;
    } catch (err) {
      const errorMsg = err.response && err.response.data.msg
        ? err.response.data.msg
        : '添加用户故事到Sprint失败';
        
      dispatch(showAlert(errorMsg, 'error'));
      
      return rejectWithValue(errorMsg);
    }
  }
);

// 将用户故事从Sprint中移除
export const removeStoryFromSprint = createAsyncThunk(
  'story/removeStoryFromSprint',
  async ({ projectId, storyId }, { rejectWithValue, dispatch }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const res = await axios.put(
        `/api/projects/${projectId}/stories/${storyId}/sprint`,
        { sprint_id: null },
        config
      );
      
      dispatch(showAlert('用户故事已从Sprint中移除', 'success'));
      
      return res.data;
    } catch (err) {
      const errorMsg = err.response && err.response.data.msg
        ? err.response.data.msg
        : '从Sprint中移除用户故事失败';
        
      dispatch(showAlert(errorMsg, 'error'));
      
      return rejectWithValue(errorMsg);
    }
  }
);

const initialState = {
  stories: [],
  currentStory: null,
  loading: false,
  error: null
};

const storySlice = createSlice({
  name: 'story',
  initialState,
  reducers: {
    clearCurrentStory: (state) => {
      state.currentStory = null;
    },
    clearStoryError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // 获取项目的所有用户故事
      .addCase(getStories.pending, (state) => {
        state.loading = true;
      })
      .addCase(getStories.fulfilled, (state, action) => {
        state.loading = false;
        state.stories = action.payload;
        state.error = null;
      })
      .addCase(getStories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 获取Sprint的所有用户故事
      .addCase(getStoriesBySprint.pending, (state) => {
        state.loading = true;
      })
      .addCase(getStoriesBySprint.fulfilled, (state, action) => {
        state.loading = false;
        state.stories = action.payload;
        state.error = null;
      })
      .addCase(getStoriesBySprint.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 获取Epic的所有用户故事
      .addCase(getStoriesByEpic.pending, (state) => {
        state.loading = true;
      })
      .addCase(getStoriesByEpic.fulfilled, (state, action) => {
        state.loading = false;
        state.stories = action.payload;
        state.error = null;
      })
      .addCase(getStoriesByEpic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 获取单个用户故事
      .addCase(getStory.pending, (state) => {
        state.loading = true;
      })
      .addCase(getStory.fulfilled, (state, action) => {
        state.loading = false;
        state.currentStory = action.payload;
        state.error = null;
      })
      .addCase(getStory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 创建用户故事
      .addCase(createStory.pending, (state) => {
        state.loading = true;
      })
      .addCase(createStory.fulfilled, (state, action) => {
        state.loading = false;
        state.stories.push(action.payload);
        state.error = null;
      })
      .addCase(createStory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 更新用户故事
      .addCase(updateStory.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateStory.fulfilled, (state, action) => {
        state.loading = false;
        state.stories = state.stories.map(story =>
          story.id === action.payload.id ? action.payload : story
        );
        if (state.currentStory && state.currentStory.id === action.payload.id) {
          state.currentStory = action.payload;
        }
        state.error = null;
      })
      .addCase(updateStory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 删除用户故事
      .addCase(deleteStory.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteStory.fulfilled, (state, action) => {
        state.loading = false;
        state.stories = state.stories.filter(story => story.id !== action.payload.storyId);
        if (state.currentStory && state.currentStory.id === action.payload.storyId) {
          state.currentStory = null;
        }
        state.error = null;
      })
      .addCase(deleteStory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 更新用户故事状态
      .addCase(updateStoryStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateStoryStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.stories = state.stories.map(story =>
          story.id === action.payload.id ? action.payload : story
        );
        if (state.currentStory && state.currentStory.id === action.payload.id) {
          state.currentStory = action.payload;
        }
        state.error = null;
      })
      .addCase(updateStoryStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 将用户故事添加到Sprint
      .addCase(addStoryToSprint.pending, (state) => {
        state.loading = true;
      })
      .addCase(addStoryToSprint.fulfilled, (state, action) => {
        state.loading = false;
        state.stories = state.stories.map(story =>
          story.id === action.payload.id ? action.payload : story
        );
        if (state.currentStory && state.currentStory.id === action.payload.id) {
          state.currentStory = action.payload;
        }
        state.error = null;
      })
      .addCase(addStoryToSprint.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 将用户故事从Sprint中移除
      .addCase(removeStoryFromSprint.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeStoryFromSprint.fulfilled, (state, action) => {
        state.loading = false;
        state.stories = state.stories.map(story =>
          story.id === action.payload.id ? action.payload : story
        );
        if (state.currentStory && state.currentStory.id === action.payload.id) {
          state.currentStory = action.payload;
        }
        state.error = null;
      })
      .addCase(removeStoryFromSprint.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearCurrentStory, clearStoryError } = storySlice.actions;

export default storySlice.reducer;