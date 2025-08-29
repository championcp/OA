import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../services/api';

export const generateSprintPlan = createAsyncThunk(
  'sprints/generatePlan',
  async ({ projectId, durationWeeks }) => {
    const response = await api.get('/sprints/preview', {
      params: { projectId, durationWeeks }
    });
    return response.data;
  }
);

export const createSprint = createAsyncThunk(
  'sprints/create',
  async (sprintData) => {
    const response = await api.post('/sprints', sprintData);
    return response.data;
  }
);

const sprintsSlice = createSlice({
  name: 'sprints',
  initialState: {
    loading: false,
    error: null,
    currentSprint: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(generateSprintPlan.pending, (state) => {
        state.loading = true;
      })
      .addCase(generateSprintPlan.fulfilled, (state, action) => {
        state.loading = false;
        state.preview = action.payload;
      })
      .addCase(createSprint.fulfilled, (state, action) => {
        state.currentSprint = action.payload;
      });
  }
});

export default sprintsSlice.reducer;