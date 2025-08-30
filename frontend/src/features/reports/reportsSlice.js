import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeReport: null,
  reportConfig: {
    type: 'velocity',
    period: 'last_4_sprints'
  }
};

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    setActiveReport(state, action) {
      state.activeReport = action.payload;
    },
    updateReportConfig(state, action) {
      state.reportConfig = {
        ...state.reportConfig,
        ...action.payload
      };
    }
  }
});

export const { setActiveReport, updateReportConfig } = reportsSlice.actions;
export default reportsSlice.reducer;