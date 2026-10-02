import { useEffect, useMemo, useRef, useState } from "react";
import Botao from "../ui/Botao.jsx";
import {
  ajustarZoomRecorte,
  criarRecorteInicial,
  moverRecorte,
  PROPORCAO_RECORTE,
} from "../../utils/recorteImagem.js";
import "./cortador-foto.css";

function CortadorFoto({ arquivo, aoCancelar, aoConfirmar }) {
  const url = useMemo(() => URL.createObjectURL(arquivo), [arquivo]);
  const molduraRef = useRef(null);
  const arrasteRef = useRef(null);
  const [dimensoes, setDimensoes] = useState(null);
  const [recorte, setRecorte] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => () => URL.revokeObjectURL(url), [url]);

  function carregarImagem(event) {
    const imagem = event.currentTarget;
    const tamanho = { largura: imagem.naturalWidth, altura: imagem.naturalHeight };
    setDimensoes(tamanho);
    setRecorte(criarRecorteInicial(tamanho.largura, tamanho.altura));
  }

  function iniciarArraste(event) {
    if (!recorte || !molduraRef.current) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    arrasteRef.current = { x: event.clientX, y: event.clientY };
  }

  function arrastar(event) {
    if (!arrasteRef.current || !recorte || !dimensoes || !molduraRef.current) return;
    const caixa = molduraRef.current.getBoundingClientRect();
    const deltaX = (arrasteRef.current.x - event.clientX) * recorte.largura / caixa.width;
    const deltaY = (arrasteRef.current.y - event.clientY) * recorte.altura / caixa.height;
    arrasteRef.current = { x: event.clientX, y: event.clientY };
    setRecorte((atual) => moverRecorte(atual, deltaX, deltaY, dimensoes.largura, dimensoes.altura));
  }

  function ajustarZoom(event) {
    const novoZoom = Number(event.target.value);
    setZoom(novoZoom);
    if (recorte && dimensoes) {
      setRecorte(ajustarZoomRecorte(recorte, dimensoes.largura, dimensoes.altura, novoZoom));
    }
  }

  function moverPeloTeclado(event) {
    if (!recorte || !dimensoes) return;
    const passo = recorte.largura * 0.025;
    const movimentos = {
      ArrowLeft: [-passo, 0], ArrowRight: [passo, 0],
      ArrowUp: [0, -passo], ArrowDown: [0, passo],
    };
    const movimento = movimentos[event.key];
    if (movimento) {
      event.preventDefault();
      setRecorte((atual) => moverRecorte(atual, ...movimento, dimensoes.largura, dimensoes.altura));
    }
  }

  async function confirmarRecorte() {
    if (!recorte || !dimensoes) return;
    setSalvando(true);
    setErro("");
    try {
      const imagem = new Image();
      imagem.src = url;
      await imagem.decode();
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = Math.round(canvas.width / PROPORCAO_RECORTE);
      const contexto = canvas.getContext("2d");
      if (!contexto) throw new Error("Não foi possível preparar o recorte.");
      contexto.fillStyle = "#fff";
      contexto.fillRect(0, 0, canvas.width, canvas.height);
      contexto.drawImage(imagem, recorte.x, recorte.y, recorte.largura, recorte.altura, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise((resolve, reject) => canvas.toBlob(
        (resultado) => resultado ? resolve(resultado) : reject(new Error("Não foi possível gerar a foto recortada.")),
        "image/jpeg",
        0.92,
      ));
      const nomeBase = arquivo.name.replace(/\.[^.]+$/, "") || "foto-animal";
      aoConfirmar(new File([blob], `${nomeBase}-recortada.jpg`, { type: "image/jpeg" }));
    } catch (falha) {
      console.error("Falha ao recortar foto:", falha);
      setErro("Não foi possível recortar a foto. Tente escolher outra imagem.");
      setSalvando(false);
    }
  }

  return (
    <div className="cortador-foto-fundo">
      <section className="cortador-foto" role="dialog" aria-modal="true" aria-labelledby="titulo-cortador-foto">
        <h2 id="titulo-cortador-foto">Ajustar foto do animal</h2>
        <p>Arraste a imagem para enquadrar. Use o controle para aproximar ou afastar.</p>
        <div
          className="moldura-recorte-foto"
          ref={molduraRef}
          role="group"
          aria-label="Área de recorte 4 por 3. Use as setas do teclado para ajustar a posição."
          tabIndex={0}
          onKeyDown={moverPeloTeclado}
          onPointerDown={iniciarArraste}
          onPointerMove={arrastar}
          onPointerUp={() => { arrasteRef.current = null; }}
          onPointerCancel={() => { arrasteRef.current = null; }}
        >
          <img
            src={url}
            alt="Foto original para recorte"
            onLoad={carregarImagem}
            draggable="false"
            style={recorte ? {
              width: `${dimensoes.largura / recorte.largura * 100}%`,
              height: `${dimensoes.altura / recorte.altura * 100}%`,
              left: `${-recorte.x / recorte.largura * 100}%`,
              top: `${-recorte.y / recorte.altura * 100}%`,
            } : undefined}
          />
        </div>
        <label className="controle-zoom-recorte">
          Zoom
          <input type="range" min="1" max="3" step="0.05" value={zoom} onChange={ajustarZoom} aria-label="Zoom da foto" />
        </label>
        {erro && <p className="erro-recorte-foto" role="alert">{erro}</p>}
        <div className="acoes-recorte-foto">
          <Botao variant="secundario" onClick={aoCancelar} disabled={salvando}>Cancelar</Botao>
          <Botao onClick={confirmarRecorte} disabled={!recorte} loading={salvando}>Usar recorte</Botao>
        </div>
      </section>
    </div>
  );
}

export default CortadorFoto;
