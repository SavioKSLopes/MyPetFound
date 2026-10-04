import test from "node:test";
import assert from "node:assert/strict";
import {
  copiarTexto,
  ehUrlPublicaDeAnuncio,
  montarTextoCompartilhamento,
  montarUrlFacebook,
  montarUrlPublicaAnuncio,
  montarUrlWhatsApp,
  montarUrlX,
  obterUrlPublicaAnuncio,
} from "./compartilhamento.js";
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
  assert.match(texto, /Porte: Médio/);
  assert.match(texto, /Características: Vira-lata, Caramelo/);
  assert.doesNotMatch(texto, /privado/);
  assert.match(texto, /\n/);
});

test("URLs de compartilhamento são codificadas e usam o anúncio público", () => {
  const animal = { id: 8, nome: "Tico" };
  const url = montarUrlPublicaAnuncio(animal, "https://pets.example");
  const texto = "Ajude a encontrar Tico.\nSão João";
  const whatsapp = new URL(montarUrlWhatsApp(texto));
  const facebook = new URL(montarUrlFacebook(url));
  const x = new URL(montarUrlX(texto, url));

  assert.equal(url, "https://pets.example/animais/8");
  assert.equal(whatsapp.origin, "https://wa.me");
  assert.equal(whatsapp.searchParams.get("text"), texto);
  assert.equal(facebook.searchParams.get("u"), url);
  assert.equal(x.searchParams.get("text"), texto);
  assert.equal(x.searchParams.get("url"), url);
});

test("Facebook recebe somente o parâmetro u com a URL pública codificada", () => {
  const urlPublica = "https://pets.example/animais/123?cidade=São João&campanha=adoção";
  const urlFacebook = montarUrlFacebook(urlPublica);
  const parsed = new URL(urlFacebook);

  assert.equal(
    urlFacebook,
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(urlPublica)}`,
  );
  assert.deepEqual([...parsed.searchParams.keys()], ["u"]);
  assert.equal(parsed.searchParams.get("u"), urlPublica);
  assert.equal(ehUrlPublicaDeAnuncio(urlPublica), true);
});

test("URL do Facebook rejeita rota privada, QR Code, token e URL vazia", () => {
  for (const url of [
    "",
    "https://pets.example/meus-animais/123",
    "https://pets.example/identificacao/assinatura-qr",
    "https://pets.example/animais/123?access_token=secreto",
  ]) {
    assert.equal(ehUrlPublicaDeAnuncio(url), false);
    assert.throws(() => montarUrlFacebook(url), TypeError);
  }
});

test("fallback de copiar usa textarea temporário quando Clipboard API não está disponível", async () => {
  const documentoOriginal = Object.getOwnPropertyDescriptor(globalThis, "document");
  const contextoSeguroOriginal = Object.getOwnPropertyDescriptor(globalThis, "isSecureContext");
  let campoRemovido = false;
  let textoSelecionado = "";
  const mockDocument = {
    body: { appendChild(campo) { textoSelecionado = campo.value; } },
    createElement() {
      return {
        value: "",
        style: {},
        setAttribute() {},
        select() {},
        remove() { campoRemovido = true; },
      };
    },
    execCommand(comando) { return comando === "copy"; },
  };

  Object.defineProperty(globalThis, "document", { configurable: true, value: mockDocument });
  Object.defineProperty(globalThis, "isSecureContext", { configurable: true, value: false });
  try {
    assert.equal(await copiarTexto("texto para copiar"), true);
    assert.equal(textoSelecionado, "texto para copiar");
    assert.equal(campoRemovido, true);
  } finally {
    if (documentoOriginal) Object.defineProperty(globalThis, "document", documentoOriginal);
    else delete globalThis.document;
    if (contextoSeguroOriginal) Object.defineProperty(globalThis, "isSecureContext", contextoSeguroOriginal);
    else delete globalThis.isSecureContext;
  }
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
