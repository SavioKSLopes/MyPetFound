import test from "node:test";
import assert from "node:assert/strict";
import { montarTextoCompartilhamento, obterUrlPublicaAnuncio } from "./compartilhamento.js";
import { normalizarUrlImagem } from "./imagem.js";
import { ordenarEventosHistorico } from "./historico.js";
import { normalizarApiBaseUrl } from "../services/api.js";
import { ajustarZoomRecorte, criarRecorteInicial, moverRecorte, PROPORCAO_RECORTE } from "./recorteImagem.js";

test("texto de compartilhamento mantém acentos e usa somente dados do anúncio", () => {
  const texto = montarTextoCompartilhamento({
    id: 8, nome: "Tico", especie_nome: "Cão", raca: "Vira-lata", cor: "Caramelo",
    porte_nome: "Médio", localidade: "São João", telefone: "privado", tutor: "privado",
  }, "https://pets.example/animais/8");
  assert.match(texto, /São João/);
  assert.match(texto, /Características: Vira-lata, Caramelo, Médio/);
  assert.doesNotMatch(texto, /privado/);
  assert.match(texto, /\n/);
});

test("anúncio canônico e imagem relativa são resolvidos na origem adequada", () => {
  assert.equal(obterUrlPublicaAnuncio(8, "https://pets.example/base"), "https://pets.example/animais/8");
  assert.equal(normalizarUrlImagem("/media/animais/luna.png", "https://api.example/api/v1", "https://web.example"), "https://api.example/media/animais/luna.png");
  assert.equal(normalizarUrlImagem("https://cdn.example/luna.png", "https://api.example/api/v1"), "https://cdn.example/luna.png");
  assert.equal(normalizarUrlImagem("blob:preview", "https://api.example/api/v1"), "blob:preview");
});

test("URL base da API remove barras finais e rejeita caminhos de arquivo .env", () => {
  assert.equal(normalizarApiBaseUrl("http://localhost:8000/api/v1///"), "http://localhost:8000/api/v1");
  assert.equal(normalizarApiBaseUrl("/api/v1"), "/api/v1");
  assert.equal(normalizarApiBaseUrl("http://localhost:8000/api/v1.env"), "http://localhost:8000/api/v1");
  assert.equal(normalizarApiBaseUrl("/api/v1/.env"), "http://localhost:8000/api/v1");
});

test("eventos do histórico ordenam pelos timestamps originais", () => {
  const eventos = [{ id: "mais-novo", data_hora: "2025-02-01T12:00:00Z" }, { id: "mais-antigo", data_hora: "2024-12-01T12:00:00Z" }];
  assert.deepEqual(ordenarEventosHistorico(eventos).map(({ id }) => id), ["mais-antigo", "mais-novo"]);
  assert.equal(eventos[0].id, "mais-novo", "não altera o array original");
});

test("recorte inicial de foto mantém proporção e cabe na imagem vertical", () => {
  const recorte = criarRecorteInicial(1152, 2048);
  assert.equal(recorte.largura / recorte.altura, PROPORCAO_RECORTE);
  assert.ok(recorte.x >= 0 && recorte.y >= 0);
  assert.ok(recorte.x + recorte.largura <= 1152);
  assert.ok(recorte.y + recorte.altura <= 2048);
});

test("zoom e arraste mantêm o recorte dentro dos limites da foto", () => {
  const inicial = criarRecorteInicial(1152, 2048);
  const aproximado = ajustarZoomRecorte(inicial, 1152, 2048, 2);
  assert.ok(aproximado.largura < inicial.largura);
  assert.equal(aproximado.largura / aproximado.altura, PROPORCAO_RECORTE);

  const movido = moverRecorte(aproximado, 100000, 100000, 1152, 2048);
  assert.equal(movido.x + movido.largura, 1152);
  assert.equal(movido.y + movido.altura, 2048);
});
