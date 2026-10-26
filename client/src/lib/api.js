// One shared Axios instance for every API call.
// - adds the login token to each request
// - turns server errors into a simple, readable message
import axios from 'axios';

export const TOKEN_KEY = 'staynest_token';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
});

// Attach "Authorization: Bearer <token>" when the user is logged in
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Called when the server says our token is no longer valid (set by AuthContext)
let onUnauthorized = () => {};
export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const hadToken = Boolean(error.config?.headers?.Authorization);
    if (status === 401 && hadToken) onUnauthorized();
    return Promise.reject(normalizeError(error));
  }
);

/**
 * Every failed request becomes: { message, status, fieldErrors }
 * fieldErrors looks like { email: 'Enter a valid email address' }
 */
function normalizeError(error) {
  if (error.response) {
    const { data, status } = error.response;
    const fieldErrors = {};
    for (const item of data?.errors ?? []) fieldErrors[item.field] = item.message;
    return { message: data?.message || 'Something went wrong', status, fieldErrors };
  }
  if (error.code === 'ECONNABORTED') {
    return { message: 'The server took too long to answer. Please try again.', status: 0, fieldErrors: {} };
  }
  return { message: 'Cannot reach the server. Is the API running?', status: 0, fieldErrors: {} };
}

// Removes empty values so the URL stays clean: { a: '', b: 2 } -> { b: 2 }
export const cleanParams = (params) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined));
