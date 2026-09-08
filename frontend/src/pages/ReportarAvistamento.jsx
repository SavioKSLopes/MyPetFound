import { useState } from "react";

import { api } from "../services/api";
import "./ReportarAvistamento.css";


function ReportarAvistamento({ animal, aoFechar }) {
  const [localidade, setLocalidade] = useState("");
  const [dataHora, setDataHora] = useState("");
  const [descricao, setDescricao] = useState("");
  const [nomeContato, setNomeContato] = useState("");
  const [telefoneContato, setTelefoneContato] = useState("");
  const [foto, setFoto] = useState(null);

  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [enviado, setEnviado] = useState(false);

  async function enviarAvistamento(event) {
    event.preventDefault();
    setErro("");

    if (!animal.ocorrencia_id) {
      setErro(
        "Não foi possível identificar a ocorrência ativa deste animal.",
      );
      return;
    }

    setEnviando(true);

    const dados = new FormData();

    dados.append("ocorrencia", animal.ocorrencia_id);
    dados.append("localidade", localidade);
    dados.append("data_hora", dataHora);
    dados.append("descricao", descricao);
    dados.append("nome_contato", nomeContato);
    dados.append("telefone_contato", telefoneContato);

    if (foto) {
      dados.append("foto", foto);
    }

    try {
      await api.post(
        "/publico/avistamentos/",
        dados,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setEnviado(true);
    } catch (error) {
      console.error("Erro ao enviar avistamento:", error);

      const errosDaApi = error.response?.data;

      if (errosDaApi) {
        const primeiroCampo = Object.keys(errosDaApi)[0];
        const mensagem = errosDaApi[primeiroCampo];

        setErro(
          Array.isArray(mensagem)
            ? mensagem[0]
            : "Verifique os dados e tente novamente.",
        );
      } else {
        setErro(
          "Não foi possível enviar o avistamento. " +
          "Tente novamente em alguns instantes.",
        );
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div
      className="modal-fundo"
      role="presentation"
      onMouseDown={aoFechar}
    >
      <section
        className="modal-avistamento"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-avistamento"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className="botao-fechar-modal"
          type="button"
          onClick={aoFechar}
          aria-label="Fechar"
        >
          ×
        </button>

        {enviado ? (
          <div className="sucesso-avistamento">
            <span aria-hidden="true">✓</span>

            <h2>Avistamento enviado!</h2>

            <p>
              Obrigado por ajudar a encontrar {animal.nome}. O tutor poderá
              visualizar essas informações no painel dele.
            </p>

            <button
              className="botao-enviar-avistamento"
              type="button"
              onClick={aoFechar}
            >
              Fechar
            </button>
          </div>
        ) : (
          <>
            <header className="cabecalho-modal">
              <p className="tag">
                Ajude a encontrar {animal.nome}
              </p>

              <h2 id="titulo-avistamento">
                Reportar avistamento
              </h2>

              <p>
                Informe o local e o horário aproximado. Seus dados de contato
                são opcionais e serão acessíveis somente ao tutor.
              </p>
            </header>

            <form onSubmit={enviarAvistamento}>
              <div className="campo-formulario">
                <label htmlFor="localidade">
                  Onde você viu {animal.nome}? *
                </label>

                <input
                  id="localidade"
                  type="text"
                  value={localidade}
                  onChange={(event) => {
                    setLocalidade(event.target.value);
                  }}
                  placeholder="Ex.: Praça do Feijão, Centro, Guanambi-BA"
                  required
                />
              </div>

              <div className="campo-formulario">
                <label htmlFor="data_hora">
                  Quando você viu? *
                </label>

                <input
                  id="data_hora"
                  type="datetime-local"
                  value={dataHora}
                  onChange={(event) => {
                    setDataHora(event.target.value);
                  }}
                  required
                />
              </div>

              <div className="campo-formulario">
                <label htmlFor="descricao">
                  Informações adicionais
                </label>

                <textarea
                  id="descricao"
                  value={descricao}
                  onChange={(event) => {
                    setDescricao(event.target.value);
                  }}
                  rows="5"
                  placeholder="Ex.: Ela estava perto da praça, parecia assustada e seguia em direção ao centro."
                />
              </div>

              <div className="campo-formulario">
                <label htmlFor="foto">
                  Foto do avistamento <span>(opcional)</span>
                </label>

                <input
                  id="foto"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) => {
                    setFoto(event.target.files?.[0] || null);
                  }}
                />

                <small>
                  Envie uma foto somente se ela foi tirada no momento do
                  avistamento.
                </small>
              </div>

              <div className="campo-formulario">
                <label htmlFor="nome_contato">
                  Seu nome <span>(opcional)</span>
                </label>

                <input
                  id="nome_contato"
                  type="text"
                  value={nomeContato}
                  onChange={(event) => {
                    setNomeContato(event.target.value);
                  }}
                  placeholder="Como podemos chamar você?"
                />
              </div>

              <div className="campo-formulario">
                <label htmlFor="telefone_contato">
                  Telefone ou WhatsApp <span>(opcional)</span>
                </label>

                <input
                  id="telefone_contato"
                  type="tel"
                  value={telefoneContato}
                  onChange={(event) => {
                    setTelefoneContato(event.target.value);
                  }}
                  placeholder="(77) 99999-9999"
                />
              </div>

              {erro && (
                <p className="erro-formulario" role="alert">
                  {erro}
                </p>
              )}

              <div className="acoes-modal">
                <button
                  className="botao-cancelar-avistamento"
                  type="button"
                  onClick={aoFechar}
                  disabled={enviando}
                >
                  Cancelar
                </button>

                <button
                  className="botao-enviar-avistamento"
                  type="submit"
                  disabled={enviando}
                >
                  {enviando
                    ? "Enviando..."
                    : "Enviar avistamento"}
                </button>
              </div>
            </form>
          </>
        )}
      </section>
    </div>
  );
}

export default ReportarAvistamento;