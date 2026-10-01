import "./ui.css";

function SecaoCabecalho({
  etiqueta,
  titulo,
  descricao,
  acao,
  className = "",
  conteudoClassName = "",
  etiquetaClassName = "",
  tituloAs: Titulo = "h2",
}) {
  return (
    <header className={`secao-cabecalho-ui ${className}`.trim()}>
      <div className={`secao-cabecalho-conteudo ${conteudoClassName}`.trim()}>
        {etiqueta && (
          <p className={`secao-cabecalho-etiqueta ${etiquetaClassName}`.trim()}>
            {etiqueta}
          </p>
        )}
        <Titulo>{titulo}</Titulo>
        {descricao && <p className="secao-cabecalho-descricao">{descricao}</p>}
      </div>
      {acao && <div className="secao-cabecalho-acao">{acao}</div>}
    </header>
  );
}

export default SecaoCabecalho;
