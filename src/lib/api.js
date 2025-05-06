import axios from "axios";

export const api = axios.create({
  baseURL: "https://test-fe.mysellerpintar.com/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});
