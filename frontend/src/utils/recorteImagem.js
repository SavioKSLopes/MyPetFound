export const PROPORCAO_RECORTE = 4 / 3;

function limitar(valor, minimo, maximo) {
  return Math.min(Math.max(valor, minimo), maximo);
}

export function criarRecorteInicial(largura, altura, proporcao = PROPORCAO_RECORTE) {
  const recorteLargura = Math.min(largura, altura * proporcao);
  const recorteAltura = recorteLargura / proporcao;
  return {
    x: (largura - recorteLargura) / 2,
    y: (altura - recorteAltura) / 2,
    largura: recorteLargura,
    altura: recorteAltura,
  };
}

export function ajustarZoomRecorte(recorteAtual, larguraImagem, alturaImagem, zoom, proporcao = PROPORCAO_RECORTE) {
  const larguraMaxima = Math.min(larguraImagem, alturaImagem * proporcao);
  const largura = larguraMaxima / zoom;
  const altura = largura / proporcao;
  const centroX = recorteAtual.x + recorteAtual.largura / 2;
  const centroY = recorteAtual.y + recorteAtual.altura / 2;
  return {
    x: limitar(centroX - largura / 2, 0, larguraImagem - largura),
    y: limitar(centroY - altura / 2, 0, alturaImagem - altura),
    largura,
    altura,
  };
}

export function moverRecorte(recorte, deltaX, deltaY, larguraImagem, alturaImagem) {
  return {
    ...recorte,
    x: limitar(recorte.x + deltaX, 0, larguraImagem - recorte.largura),
    y: limitar(recorte.y + deltaY, 0, alturaImagem - recorte.altura),
  };
}
