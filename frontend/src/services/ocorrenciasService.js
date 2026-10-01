import { api } from "./api.js";

export function listarOcorrencias(animalId) {
  return api.get(`/ocorrencias/?animal=${animalId}`);
}

export function registrarOcorrencia(payload) {
  return api.post("/ocorrencias/", payload);
}

export function marcarOcorrenciaComoReencontrada(id) {
  return api.post(`/ocorrencias/${id}/marcar-reencontrado/`);
}
