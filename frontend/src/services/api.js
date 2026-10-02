import axios from "axios";

const fallbackApiUrl = "http://localhost:8000/api/v1";

export function normalizarApiBaseUrl(configurada) {
  const valor = configurada?.trim();
  if (!valor || /\.env(?:\/|$)/i.test(valor)) return fallbackApiUrl;
  return valor.replace(/\/+$/, "");
}

const apiBaseUrl = normalizarApiBaseUrl(import.meta.env?.VITE_API_URL);

export const api = axios.create({
  baseURL: apiBaseUrl,
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem("mypetfound_token");

  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }

  return config;
});
