import { api } from "./api.js";

export function cadastrarUsuario(dados) {
  return api.post("/auth/cadastro/", dados);
}
