import useMensagens from "../../hooks/useMensagens.js";

import LayoutTutor from "../../components/layout/LayoutTutor";
import EstadoTela from "../../components/ui/EstadoTela";
import MensagemCard from "../../components/mensagens/MensagemCard";
import "./Mensagens.css";

function Mensagens() {
  const {
    mensagens,
    carregando,
    erro,
    atualizandoId,
    tentarCarregarMensagens,
    marcarComoLida,
  } = useMensagens();

  const mensagensNaoLidas = mensagens.filter(
    (mensagem) => !mensagem.lida,
  ).length;

  return (
    <LayoutTutor className="pagina-mensagens">

      <section className="conteudo-mensagens">
        <div className="titulo-mensagens">
          <div>
            <p>Comunicações</p>
            <h1>Mensagens recebidas</h1>
          </div>

          {!carregando && mensagensNaoLidas > 0 && (
            <span className="contador-mensagens">
              {mensagensNaoLidas} nova
              {mensagensNaoLidas > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {carregando && (
          <EstadoTela tipo="carregando" className="estado-mensagens">
            <p>Carregando mensagens...</p>
          </EstadoTela>
        )}

        {!carregando && erro && (
          <EstadoTela tipo="erro" className="erro-mensagens">
            <p>{erro}</p>

            <button type="button" onClick={tentarCarregarMensagens}>
              Tentar novamente
            </button>
          </EstadoTela>
        )}

        {!carregando && !erro && mensagens.length === 0 && (
          <EstadoTela tipo="vazio" className="vazio-mensagens">
            <span aria-hidden="true">✉️</span>
            <h2>Nenhuma mensagem ainda</h2>
            <p>
              Quando alguém enviar um aviso sobre um dos seus animais,
              ele aparecerá aqui.
            </p>
          </EstadoTela>
        )}

        {!carregando && !erro && mensagens.length > 0 && (
          <div className="lista-mensagens">
            {mensagens.map((mensagem) => (
              <MensagemCard
                key={mensagem.id}
                mensagem={mensagem}
                onMarcarComoLida={marcarComoLida}
                marcandoComoLida={atualizandoId === mensagem.id}
              />
            ))}
          </div>
        )}
      </section>
    </LayoutTutor>
  );
}

export default Mensagens;
