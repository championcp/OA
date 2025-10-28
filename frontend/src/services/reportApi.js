import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const reportApi = createApi({
  reducerPath: 'reportApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (builder) => ({
    getTemplates: builder.query({
      query: () => 'reports/templates'
    }),
    generateReport: builder.mutation({
      query: (reportData) => ({
        url: 'reports',
        method: 'POST',
        body: reportData
      })
    }),
    getReport: builder.query({
      query: (reportId) => `reports/${reportId}`
    })
  })
});

export const {
  useGetTemplatesQuery,
  useGenerateReportMutation,
  useGetReportQuery
} = reportApi;