import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import projectReducer from '../features/projects/projectSlice';
import sprintReducer from '../features/sprints/sprintSlice';
import taskReducer from '../features/tasks/taskSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectReducer,
    sprints: sprintReducer,
    tasks: taskReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});