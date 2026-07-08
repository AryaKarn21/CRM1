import api from './axios'

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),

  register: (data) => api.post('/auth/register', data),

  verifyOTP: (data) => api.post('/auth/verify-otp', data),

  forgotPassword: (email) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (email, newPassword) =>
    api.post('/auth/reset-password', {
      email,
      newPassword,
    }),

  logout: () => api.post('/auth/logout'),

  getProfile: () => api.get('/auth/me'),
}