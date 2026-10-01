import { api } from "./api.js";

export function listarMensagens() {
  return api.get("/comunicacoes/mensagens/");
}

export function marcarMensagemComoLida(id) {
  return api.patch(`/comunicacoes/mensagens/${id}/ler/`);
}

export function enviarMensagemPublica(animalId, payload) {
  return api.post(`/animais/${animalId}/mensagens/`, payload);
}
