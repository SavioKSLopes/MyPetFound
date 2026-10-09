import { api } from "./api.js";

export function cadastrarUsuario(dados) {
  return api.post("/auth/cadastro/", dados);
}

export function solicitarRedefinicaoSenha(email) {
  return api.post("/auth/esqueci-senha/", { email });
}

export function redefinirSenha(dados) {
  return api.post("/auth/redefinir-senha/", dados);
}
