import { Link } from "react-router-dom";

import Botao from "./Botao";
import "./ui.css";

const icones = {
  carregando: null,
  erro: "⚠️",
  vazio: "🐾",
  naoEncontrado: "🔎",
};

function EstadoTela({
  tipo,
  titulo,
  mensagem,
  className = "",
  children,
  acaoTexto,
  acaoPara,
  aoAcionar,
  acaoVariant = "primario",
  mostrarIndicador,
}) {
  const carregando = tipo === "carregando";
  const papel = tipo === "erro" || tipo === "naoEncontrado" ? "alert" : "status";
  const exibirIndicador = mostrarIndicador ?? !children;

  return (
    <section
      className={`estado-tela estado-tela-${tipo} ${children ? "" : "estado-tela-simples"} ${className}`.trim()}
      role={papel}
      aria-live={papel === "status" ? "polite" : undefined}
    >
      {exibirIndicador && carregando ? (
        <span className="estado-tela-carregador" aria-hidden="true" />
      ) : exibirIndicador ? (
        icones[tipo] && (
          <span className="estado-tela-icone" aria-hidden="true">
            {icones[tipo]}
          </span>
        )
      ) : null}
      {titulo && <h2>{titulo}</h2>}
      {mensagem && <p>{mensagem}</p>}
      {children}
      {acaoTexto &&
        (acaoPara ? (
          <Link className={`botao-ui botao-ui-${acaoVariant}`} to={acaoPara}>
            {acaoTexto}
          </Link>
        ) : (
          <Botao variant={acaoVariant} onClick={aoAcionar}>
            {acaoTexto}
          </Botao>
        ))}
    </section>
  );
}

export default EstadoTela;
