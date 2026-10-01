import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../../services/api.js";
import "./Mensagens.css";

function formatarData(data) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(data));
}

function Mensagens() {
  const [mensagens, setMensagens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [atualizandoId, setAtualizandoId] = useState(null);

  async function carregarMensagens() {
    try {
      setCarregando(true);
      setErro("");

      const resposta = await api.get(
        "/comunicacoes/mensagens/",
      );

      setMensagens(resposta.data);
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);

      setErro(
        "Não foi possível carregar suas mensagens. Tente novamente.",
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarMensagens();
  }, []);

  async function marcarComoLida(mensagemId) {
    try {
      setAtualizandoId(mensagemId);

      await api.patch(
        `/comunicacoes/mensagens/${mensagemId}/ler/`,
      );

      setMensagens((mensagensAtuais) =>
        mensagensAtuais.map((mensagem) =>
          mensagem.id === mensagemId
            ? { ...mensagem, lida: true }
            : mensagem,
        ),
      );
    } catch (error) {
      console.error("Erro ao marcar mensagem como lida:", error);

      setErro(
        "Não foi possível atualizar a mensagem. Tente novamente.",
      );
    } finally {
      setAtualizandoId(null);
    }
  }

  const mensagensNaoLidas = mensagens.filter(
    (mensagem) => !mensagem.lida,
  ).length;

  return (
    <main className="pagina-mensagens">
      <header className="cabecalho-mensagens">
        <Link to="/meus-animais" className="logo-mensagens">
          <span aria-hidden="true">🐾</span>
          MyPetFound
        </Link>

        <Link to="/meus-animais" className="voltar-mensagens">
          Meus animais
        </Link>
      </header>

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
          <p className="estado-mensagens" role="status">
            Carregando mensagens...
          </p>
        )}

        {!carregando && erro && (
          <div className="erro-mensagens" role="alert">
            <p>{erro}</p>

            <button type="button" onClick={carregarMensagens}>
              Tentar novamente
            </button>
          </div>
        )}

        {!carregando && !erro && mensagens.length === 0 && (
          <div className="vazio-mensagens">
            <span aria-hidden="true">✉️</span>
            <h2>Nenhuma mensagem ainda</h2>
            <p>
              Quando alguém enviar um aviso sobre um dos seus animais,
              ele aparecerá aqui.
            </p>
          </div>
        )}

        {!carregando && !erro && mensagens.length > 0 && (
          <div className="lista-mensagens">
            {mensagens.map((mensagem) => (
              <article
                key={mensagem.id}
                className={
                  mensagem.lida
                    ? "card-mensagem"
                    : "card-mensagem card-mensagem-nova"
                }
              >
                <div className="cabecalho-card-mensagem">
                  <div>
                    <p className="animal-mensagem">
                      {mensagem.animal_nome}
                    </p>

                    <time dateTime={mensagem.criada_em}>
                      {formatarData(mensagem.criada_em)}
                    </time>
                  </div>

                  <span
                    className={
                      mensagem.lida
                        ? "status-mensagem status-mensagem-lida"
                        : "status-mensagem status-mensagem-nova"
                    }
                  >
                    {mensagem.lida ? "Lida" : "Nova"}
                  </span>
                </div>

                <p className="texto-mensagem">
                  {mensagem.mensagem}
                </p>

                {mensagem.localizacao_texto && (
                  <p className="localizacao-mensagem">
                    <span aria-hidden="true">📍</span>
                    {mensagem.localizacao_texto}
                  </p>
                )}

                {!mensagem.lida && (
                  <button
                    type="button"
                    onClick={() => marcarComoLida(mensagem.id)}
                    disabled={atualizandoId === mensagem.id}
                  >
                    {atualizandoId === mensagem.id
                      ? "Atualizando..."
                      : "Marcar como lida"}
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Mensagens;