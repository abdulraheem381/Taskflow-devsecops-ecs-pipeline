import axios from "axios";

const authBaseURL = import.meta.env.VITE_AUTH_API_URL || "http://localhost:4001/api/auth";
const tasksBaseURL = import.meta.env.VITE_TASKS_API_URL || "http://localhost:4002/api/tasks";

export const authApi = axios.create({
  baseURL: authBaseURL,
  headers: {
    "Content-Type": "application/json"
  }
});

export const tasksApi = axios.create({
  baseURL: tasksBaseURL,
  headers: {
    "Content-Type": "application/json"
  }
});

export function setTasksToken(token) {
  if (token) {
    tasksApi.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete tasksApi.defaults.headers.common.Authorization;
  }
}

