import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import projectApi from '../../services/projectApi';

// 异步thunk actions
export const getProject = createAsyncThunk(
  'projects/getProject',
  async (projectId) => {
    const response = await projectApi.getProject(projectId);
    return response.data;
  }
);

// 创建项目
export const createProject = createAsyncThunk(
  'projects/createProject',
  async (projectData) => {
    const response = await projectApi.createProject(projectData);
    return response;
  }
);

// 更新项目
export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async ({ projectId, projectData }) => {
    const response = await projectApi.updateProject(projectId, projectData);
    return response;
  }
);

// 删除项目
export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (projectId) => {
    const response = await projectApi.deleteProject(projectId);
    return response;
  }
);

// 获取项目成员
export const getProjectMembers = createAsyncThunk(
  'projects/getProjectMembers',
  async (projectId) => {
    const response = await projectApi.getProjectMembers(projectId);
    return response;
  }
);

// 添加项目成员
export const addProjectMember = createAsyncThunk(
  'projects/addProjectMember',
  async ({ projectId, memberData }) => {
    const response = await projectApi.addProjectMember(projectId, memberData);
    return response;
  }
);

// 更新项目成员角色
export const updateProjectMember = createAsyncThunk(
  'projects/updateProjectMember',
  async ({ projectId, memberId, memberData }) => {
    const response = await projectApi.updateProjectMember(projectId, memberId, memberData);
    return response;
  }
);

// 移除项目成员
export const removeProjectMember = createAsyncThunk(
  'projects/removeProjectMember',
  async ({ projectId, memberId }) => {
    const response = await projectApi.removeProjectMember(projectId, memberId);
    return response;
  }
);

const initialState = {
  projects: [],
  currentProject: null,
  projectMembers: [],
  loading: false,
  error: null
};

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearCurrentProject: (state) => {
      state.currentProject = null;
    },
    clearProjectError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProject.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProject = action.payload;
        state.error = null;
      })
      .addCase(getProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 创建项目
      .addCase(createProject.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects.push(action.payload);
        state.error = null;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 更新项目
      .addCase(updateProject.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = state.projects.map(project =>
          project.id === action.payload.id ? action.payload : project
        );
        if (state.currentProject && state.currentProject.id === action.payload.id) {
          state.currentProject = action.payload;
        }
        state.error = null;
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 删除项目
      .addCase(deleteProject.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = state.projects.filter(project => project.id !== action.payload);
        if (state.currentProject && state.currentProject.id === action.payload) {
          state.currentProject = null;
        }
        state.error = null;
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 获取项目成员
      .addCase(getProjectMembers.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProjectMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.projectMembers = action.payload;
        state.error = null;
      })
      .addCase(getProjectMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 添加项目成员
      .addCase(addProjectMember.pending, (state) => {
        state.loading = true;
      })
      .addCase(addProjectMember.fulfilled, (state, action) => {
        state.loading = false;
        state.projectMembers.push(action.payload);
        state.error = null;
      })
      .addCase(addProjectMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 更新项目成员角色
      .addCase(updateProjectMember.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProjectMember.fulfilled, (state, action) => {
        state.loading = false;
        state.projectMembers = state.projectMembers.map(member =>
          member.id === action.payload.id ? action.payload : member
        );
        state.error = null;
      })
      .addCase(updateProjectMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 移除项目成员
      .addCase(removeProjectMember.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeProjectMember.fulfilled, (state, action) => {
        state.loading = false;
        state.projectMembers = state.projectMembers.filter(
          member => !(member.project_id === action.payload.projectId && member.user_id === action.payload.userId)
        );
        state.error = null;
      })
      .addCase(removeProjectMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearCurrentProject, clearProjectError } = projectSlice.actions;

export default projectSlice.reducer;