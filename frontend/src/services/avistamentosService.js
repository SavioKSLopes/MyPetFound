import { api } from "./api.js";

export function listarAvistamentos(animalId) {
  return api.get(`/avistamentos/?animal=${animalId}`);
}

export function criarAvistamento(dados) {
  return api.post("/publico/avistamentos/", dados, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}
