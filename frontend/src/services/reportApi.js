import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const reportApi = createApi({
  reducerPath: 'reportApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: '/api/quality',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    }
  }),
  endpoints: (builder) => ({
    getReport: builder.query({
      query: (reportId) => `reports/${reportId}`,
    }),
    generateReport: builder.mutation({
      query: ({ projectId, config }) => ({
        url: `projects/${projectId}/reports/custom`,
        method: 'POST',
        body: config
      }),
    }),
    getTemplates: builder.query({
      query: () => 'report-templates',
    }),
    getFavoriteStatus: builder.query({
      query: (reportId) => `favorites/${reportId}/status`,
    }),
    addFavorite: builder.mutation({
      query: (reportId) => ({
        url: 'favorites',
        method: 'POST',
        body: { reportId }
      }),
    }),
    removeFavorite: builder.mutation({
      query: (reportId) => ({
        url: `favorites/${reportId}`,
        method: 'DELETE'
      }),
    }),
    generateShare: builder.mutation({
      query: ({ reportId, expiryDays, permissions }) => ({
        url: 'shares',
        method: 'POST',
        body: { reportId, expiryDays, permissions }
      }),
    }),
    getShareLinks: builder.query({
      query: (reportId) => `shares?reportId=${reportId}`,
    }),
    revokeShare: builder.mutation({
      query: (token) => ({
        url: `shares/${token}`,
        method: 'DELETE'
      }),
    }),
  }),
});

export const { 
  useGetReportQuery,
  useGenerateReportMutation,
  useGetTemplatesQuery,
  useGetFavoriteStatusQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
  useGenerateShareMutation,
  useGetShareLinksQuery,
  useRevokeShareMutation
} = reportApi;