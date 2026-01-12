import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
});

// RESPONSE INTERCEPTOR
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.error) {
      return Promise.reject(new Error(error.response.data.error));
    }
    return Promise.reject(
      new Error(error.message || 'Network error')
    );
  }
);

// ==============================
// RESUME APIs
// ==============================

export const uploadResume = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('resume', file);

  const response = await apiClient.post('/upload', formData, {
    onUploadProgress: (event) => {
      if (!event.total) return;
      const percent = Math.round((event.loaded * 100) / event.total);
      if (onProgress) onProgress(percent);
    },
  });

  return response.data;
};

export const getResumeStatus = async (resumeId) => {
  const response = await apiClient.get(
    `/upload/status/${resumeId}`
  );
  return response.data;
};

export const listResumes = async () => {
  const response = await apiClient.get('/upload/list');
  return response.data;
};

// ==============================
// RAG APIs
// ==============================

export const queryResume = async (resumeId, query) => {
  const response = await apiClient.post('/rag/query', {
    resumeId,
    query,
  });
  return response.data;
};

// ==============================
// AGENT APIs
// ==============================

export const executeAgent = async (task, resumeId) => {
  const response = await apiClient.post('/agent/execute', {
    task,
    resumeId,
  });
  return response.data;
};

// ==============================
// STREAMING
// ==============================

export const createStreamConnection = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

export default apiClient;
