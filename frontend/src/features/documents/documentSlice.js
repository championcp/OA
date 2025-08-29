import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { showAlert } from '../alert/alertSlice';

// 获取项目的所有文档
export const getDocuments = createAsyncThunk(
  'document/getDocuments',
  async (projectId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/projects/${projectId}/documents`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response && err.response.data.msg
          ? err.response.data.msg
          : '获取文档列表失败'
      );
    }
  }
);

// 获取单个文档
export const getDocument = createAsyncThunk(
  'document/getDocument',
  async ({ projectId, documentId }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/projects/${projectId}/documents/${documentId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response && err.response.data.msg
          ? err.response.data.msg
          : '获取文档详情失败'
      );
    }
  }
);

// 创建文档
export const createDocument = createAsyncThunk(
  'document/createDocument',
  async ({ projectId, documentData }, { rejectWithValue, dispatch }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const res = await axios.post(`/api/projects/${projectId}/documents`, documentData, config);
      
      dispatch(showAlert('文档创建成功', 'success'));
      
      return res.data;
    } catch (err) {
      const errorMsg = err.response && err.response.data.msg
        ? err.response.data.msg
        : '创建文档失败';
        
      dispatch(showAlert(errorMsg, 'error'));
      
      return rejectWithValue(errorMsg);
    }
  }
);

// 更新文档
export const updateDocument = createAsyncThunk(
  'document/updateDocument',
  async ({ projectId, documentId, documentData }, { rejectWithValue, dispatch }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const res = await axios.put(
        `/api/projects/${projectId}/documents/${documentId}`,
        documentData,
        config
      );
      
      dispatch(showAlert('文档更新成功', 'success'));
      
      return res.data;
    } catch (err) {
      const errorMsg = err.response && err.response.data.msg
        ? err.response.data.msg
        : '更新文档失败';
        
      dispatch(showAlert(errorMsg, 'error'));
      
      return rejectWithValue(errorMsg);
    }
  }
);

// 删除文档
export const deleteDocument = createAsyncThunk(
  'document/deleteDocument',
  async ({ projectId, documentId }, { rejectWithValue, dispatch }) => {
    try {
      await axios.delete(`/api/projects/${projectId}/documents/${documentId}`);
      
      dispatch(showAlert('文档删除成功', 'success'));
      
      return { projectId, documentId };
    } catch (err) {
      const errorMsg = err.response && err.response.data.msg
        ? err.response.data.msg
        : '删除文档失败';
        
      dispatch(showAlert(errorMsg, 'error'));
      
      return rejectWithValue(errorMsg);
    }
  }
);

// 添加文档评论
export const addDocumentComment = createAsyncThunk(
  'document/addDocumentComment',
  async ({ projectId, documentId, content }, { rejectWithValue, dispatch }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const res = await axios.post(
        `/api/projects/${projectId}/documents/${documentId}/comments`,
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

// 获取文档版本历史
export const getDocumentHistory = createAsyncThunk(
  'document/getDocumentHistory',
  async ({ projectId, documentId }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/projects/${projectId}/documents/${documentId}/history`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response && err.response.data.msg
          ? err.response.data.msg
          : '获取文档历史失败'
      );
    }
  }
);

const initialState = {
  documents: [],
  currentDocument: null,
  documentHistory: [],
  loading: false,
  error: null
};

const documentSlice = createSlice({
  name: 'document',
  initialState,
  reducers: {
    clearCurrentDocument: (state) => {
      state.currentDocument = null;
    },
    clearDocumentError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // 获取项目的所有文档
      .addCase(getDocuments.pending, (state) => {
        state.loading = true;
      })
      .addCase(getDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = action.payload;
        state.error = null;
      })
      .addCase(getDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 获取单个文档
      .addCase(getDocument.pending, (state) => {
        state.loading = true;
      })
      .addCase(getDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDocument = action.payload;
        state.error = null;
      })
      .addCase(getDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 创建文档
      .addCase(createDocument.pending, (state) => {
        state.loading = true;
      })
      .addCase(createDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.documents.push(action.payload);
        state.error = null;
      })
      .addCase(createDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 更新文档
      .addCase(updateDocument.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = state.documents.map(document =>
          document.id === action.payload.id ? action.payload : document
        );
        if (state.currentDocument && state.currentDocument.id === action.payload.id) {
          state.currentDocument = action.payload;
        }
        state.error = null;
      })
      .addCase(updateDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 删除文档
      .addCase(deleteDocument.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = state.documents.filter(document => document.id !== action.payload.documentId);
        if (state.currentDocument && state.currentDocument.id === action.payload.documentId) {
          state.currentDocument = null;
        }
        state.error = null;
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 添加文档评论
      .addCase(addDocumentComment.pending, (state) => {
        state.loading = true;
      })
      .addCase(addDocumentComment.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentDocument) {
          if (!state.currentDocument.comments) {
            state.currentDocument.comments = [];
          }
          state.currentDocument.comments.push(action.payload);
        }
        state.error = null;
      })
      .addCase(addDocumentComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 获取文档版本历史
      .addCase(getDocumentHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(getDocumentHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.documentHistory = action.payload;
        state.error = null;
      })
      .addCase(getDocumentHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearCurrentDocument, clearDocumentError } = documentSlice.actions;

export default documentSlice.reducer;