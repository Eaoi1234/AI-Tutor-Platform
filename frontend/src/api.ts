// src/api.ts
import axios from "axios";

const baseURL = import.meta.env.BACK_SERVER || "http://localhost:5050/api";

export const api = axios.create({
  baseURL,
  // Do not set Content-Type globally! Let Axios handle it per request.
});

// Chapters
export const fetchChapters = () => api.get("/chapters").then((res) => res.data);

export const fetchChapter = (id: string) =>
  api.get(`/chapters/${id}`).then((res) => res.data);

export const createChapter = (payload: { name: string }) =>
  api
    .post("/chapters", payload, {
      headers: { "Content-Type": "application/json" },
    })
    .then((res) => res.data);

// Files
export const fetchFiles = () => api.get("/files").then((res) => res.data);

export const uploadFile = (form: FormData) =>
  api.post("/file/upload", form).then((res) => res.data);
