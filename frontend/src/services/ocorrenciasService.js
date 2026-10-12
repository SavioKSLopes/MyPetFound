import { api } from "./api.js";

export function listarOcorrencias(animalId) {
  return api.get(`/ocorrencias/?animal=${animalId}`);
}

export function registrarOcorrencia(payload) {
  return api.post("/ocorrencias/", payload);
}

export function marcarOcorrenciaComoReencontrada(id, dados = {}) {
  return api.post(`/ocorrencias/${id}/marcar-reencontrado/`, dados);
}
