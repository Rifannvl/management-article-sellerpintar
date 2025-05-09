import axios from "axios";

export const api = axios.create({
  baseURL: "https://test-fe.mysellerpintar.com/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Interceptor untuk menyisipkan token Authorization dari localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    console.log("Token dari interceptor:", token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});
