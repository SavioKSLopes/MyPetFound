import { api } from "./api.js";

export function listarMeusAnimais() {
  return api.get("/animais/");
}

export function buscarAnimais(params = {}) {
  return api.get("/publico/animais-perdidos/", { params });
}

export function obterAnimalPublico(id) {
  return api.get(`/publico/animais-perdidos/${id}/`);
}

export function obterAnimalTutor(id) {
  return api.get(`/animais/${id}/`);
}

export function obterHistoricoAnimal(id) {
  return api.get(`/animais/${id}/historico/`);
}

export function obterIdentificacaoAnimal(codigo) {
  return api.get(`/publico/identificacao/${codigo}/`);
}

export function criarAnimal(dados) {
  return api.post("/animais/", dados);
}

export function atualizarAnimal(id, dados) {
  return api.patch(`/animais/${id}/`, dados);
}

export function obterQrCodeAnimal(id) {
  return api.get(`/animais/${id}/qrcode/`, { responseType: "blob" });
}
