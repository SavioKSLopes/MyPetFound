import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { api } from "../services/api";
import "./RegistrarDesaparecimento.css";


function RegistrarDesaparecimento() {
  const { id } = useParams();
  const navegar = useNavigate();

  const agora = new Date();
  const dataLocal = new Date(
    agora.getTime() - agora.getTimezoneOffset() * 60000,
  )
    .toISOString()
    .slice(0, 16);

  const [dataHora, setDataHora] = useState(dataLocal);
  const [localidade, setLocalidade] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [descricao, setDescricao] = useState("");

  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  async function registrarDesaparecimento(event) {
    event.preventDefault();

    setErro("");
    setEnviando(true);

    const dados = {
      animal: Number(id),
      tipo: "DESAPARECIMENTO",
      data_hora: new Date(dataHora).toISOString(),
      localidade,
      descricao,
    };

    if (latitude) {
      dados.latitude = latitude;
    }

    if (longitude) {
      dados.longitude = longitude;
    }

    try {
      await api.post("/ocorrencias/", dados);

      navegar(`/meus-animais/${id}`, {
        replace: true,
      });
    } catch (error) {
      console.error("Erro ao registrar desaparecimento:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("mypetfound_token");

        navegar("/entrar", {
          replace: true,
        });

        return;
      }

      const errosDaApi = error.response?.data;

      if (errosDaApi) {
        const primeiroCampo = Object.keys(errosDaApi)[0];
        const mensagem = errosDaApi[primeiroCampo];

        setErro(
          Array.isArray(mensagem)
            ? mensagem[0]
            : "Verifique os dados preenchidos e tente novamente.",
        );
      } else {
        setErro(
          "Não foi possível registrar o desaparecimento. " +
          "Verifique se o backend está em execução.",
        );
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="pagina-registrar-desaparecimento">
      <header className="cabecalho-registrar-desaparecimento">
        <Link
          className="logo-registrar-desaparecimento"
          to="/"
        >
          <span aria-hidden="true">🐾</span>
          MyPetFound
        </Link>

        <Link
          className="voltar-gerenciamento"
          to={`/meus-animais/${id}`}
        >
          ← Voltar para o animal
        </Link>
      </header>

      <section className="conteudo-registrar-desaparecimento">
        <aside className="aviso-desaparecimento">
          <p className="tag-desaparecimento">
            Atenção
          </p>

          <h1>Seu pet desapareceu?</h1>

          <p>
            Preencha as informações abaixo para criar um anúncio público.
            Pessoas da comunidade poderão visualizar o pet e enviar
            avistamentos.
          </p>

          <div className="dica-desaparecimento">
            <span aria-hidden="true">💡</span>

            <p>
              Informe o último local onde o animal foi visto e características
              que possam ajudar alguém a reconhecê-lo.
            </p>
          </div>

          <div className="privacidade-desaparecimento">
            <span aria-hidden="true">🔒</span>

            <p>
              Seu telefone, endereço e outros dados pessoais não aparecerão
              no anúncio público.
            </p>
          </div>
        </aside>

        <section className="card-formulario-desaparecimento">
          <header>
            <p className="tag-formulario-desaparecimento">
              Criar anúncio público
            </p>

            <h2>Registrar desaparecimento</h2>

            <p>
              Os campos marcados com * são obrigatórios.
            </p>
          </header>

          <form onSubmit={registrarDesaparecimento}>
            <div className="campo-desaparecimento">
              <label htmlFor="data_hora">
                Quando ele foi visto pela última vez? *
              </label>

              <input
                id="data_hora"
                type="datetime-local"
                value={dataHora}
                onChange={(event) => setDataHora(event.target.value)}
                max={dataLocal}
                required
              />
            </div>

            <div className="campo-desaparecimento">
              <label htmlFor="localidade">
                Último local onde foi visto *
              </label>

              <input
                id="localidade"
                type="text"
                value={localidade}
                onChange={(event) => setLocalidade(event.target.value)}
                placeholder="Ex.: Bairro Ceraíma, Guanambi-BA"
                maxLength="255"
                required
              />
            </div>

            <div className="campo-desaparecimento">
              <label htmlFor="descricao">
                Informações importantes
              </label>

              <textarea
                id="descricao"
                value={descricao}
                onChange={(event) => setDescricao(event.target.value)}
                placeholder="Ex.: Usava uma coleira azul, tem uma mancha branca no peito e pode estar assustada."
                rows="6"
              />
            </div>

            <details className="coordenadas-opcionais">
              <summary>
                Adicionar localização exata no mapa
              </summary>

              <p>
                Opcional. Use apenas se você tiver as coordenadas do último
                local onde o pet foi visto.
              </p>

              <div className="grid-coordenadas">
                <div className="campo-desaparecimento">
                  <label htmlFor="latitude">
                    Latitude
                  </label>

                  <input
                    id="latitude"
                    type="number"
                    value={latitude}
                    onChange={(event) => setLatitude(event.target.value)}
                    placeholder="-14.2231"
                    step="0.000001"
                    min="-90"
                    max="90"
                  />
                </div>

                <div className="campo-desaparecimento">
                  <label htmlFor="longitude">
                    Longitude
                  </label>

                  <input
                    id="longitude"
                    type="number"
                    value={longitude}
                    onChange={(event) => setLongitude(event.target.value)}
                    placeholder="-42.7798"
                    step="0.000001"
                    min="-180"
                    max="180"
                  />
                </div>
              </div>
            </details>

            {erro && (
              <p className="erro-desaparecimento" role="alert">
                {erro}
              </p>
            )}

            <div className="acoes-desaparecimento">
              <Link
                className="botao-cancelar-desaparecimento"
                to={`/meus-animais/${id}`}
              >
                Cancelar
              </Link>

              <button
                className="botao-publicar-desaparecimento"
                type="submit"
                disabled={enviando}
              >
                {enviando
                  ? "Publicando..."
                  : "Publicar anúncio"}
              </button>
            </div>
          </form>
        </section>
      </section>
    </main>
  );
}

export default RegistrarDesaparecimento;