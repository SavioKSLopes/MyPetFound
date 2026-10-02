import { api } from "../services/api.js";

export function normalizarUrlImagem(src, baseURL = api.defaults.baseURL, origemAtual = globalThis.location?.origin || "http://localhost") {
  if (!src || /^(data:|blob:)/i.test(src)) return src || "";
  if (/^https?:\/\//i.test(src)) return src;

  try {
    const origemBackend = new URL(baseURL, origemAtual).origin;
    return new URL(src, `${origemBackend}/`).href;
  } catch {
    return src;
  }
}
