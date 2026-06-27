import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const workoutService = {
  getWorkouts: (userId) => api.get(`/workouts/${userId}`).then(res => res.data),
  addWorkout: (workoutData) => api.post('/workouts', workoutData).then(res => res.data),
  deleteWorkout: (id) => api.delete(`/workouts/${id}`).then(res => res.data),
};

export const goalService = {
  getGoals: (userId) => api.get(`/goals/${userId}`).then(res => res.data),
  addGoal: (goalData) => api.post('/goals', goalData).then(res => res.data),
  toggleGoal: (id) => api.patch(`/goals/${id}/toggle`).then(res => res.data),
  deleteGoal: (id) => api.delete(`/goals/${id}`).then(res => res.data),
};

export const coachService = {
  askCoach: (userId, question) => api.post('/coach', { user_id: userId, question }).then(res => res.data),
};

export const userService = {
  getProfile: (userId) => api.get(`/users/${userId}`).then(res => res.data),
  getProfileByEmail: (email) => api.get(`/users/email/${email}`).then(res => res.data),
  saveProfile: (profileData) => api.post('/users', profileData).then(res => res.data),
};

export default api;
