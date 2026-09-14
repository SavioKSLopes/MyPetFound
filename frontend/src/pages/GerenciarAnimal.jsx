import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { api } from "../services/api";
import "./GerenciarAnimal.css";

function GerenciarAnimal() {
  const { id } = useParams();
  const navegar = useNavigate();

  const [animal, setAnimal] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [avistamentos, setAvistamentos] = useState([]);
  const [carregandoAvistamentos, setCarregandoAvistamentos] =
    useState(true);
  const [erroAvistamentos, setErroAvistamentos] = useState("");

  const [ocorrencias, setOcorrencias] = useState([]);
  const [marcandoReencontrado, setMarcandoReencontrado] =
    useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [erroOcorrencia, setErroOcorrencia] = useState("");

  useEffect(() => {
    async function carregarDados() {
      try {
        setCarregando(true);
        setCarregandoAvistamentos(true);
        setErro("");
        setErroAvistamentos("");
        setErroOcorrencia("");

        const [
          respostaAnimal,
          respostaAvistamentos,
          respostaOcorrencias,
        ] = await Promise.all([
          api.get(`/animais/${id}/`),
          api.get(`/avistamentos/?animal=${id}`),
          api.get(`/ocorrencias/?animal=${id}`),
        ]);

        setAnimal(respostaAnimal.data);

        const dadosAvistamentos = Array.isArray(
          respostaAvistamentos.data,
        )
          ? respostaAvistamentos.data
          : respostaAvistamentos.data.results || [];

        setAvistamentos(dadosAvistamentos);

        const dadosOcorrencias = Array.isArray(
          respostaOcorrencias.data,
        )
          ? respostaOcorrencias.data
          : respostaOcorrencias.data.results || [];

        setOcorrencias(dadosOcorrencias);
      } catch (error) {
        console.error("Erro ao carregar dados do animal:", error);
        console.error(
          "Detalhes do erro:",
          error.response?.data,
        );

        if (error.response?.status === 401) {
          localStorage.removeItem("mypetfound_token");

          navegar("/entrar", {
            replace: true,
          });

          return;
        }

        if (error.response?.status === 404) {
          setErro(
            "Este animal não foi encontrado ou não pertence à sua conta.",
          );

          return;
        }

        if (error.config?.url?.includes("/avistamentos/")) {
          setErroAvistamentos(
            "Não foi possível carregar os avistamentos deste animal.",
          );
        } else {
          setErro(
            "Não foi possível carregar os dados do animal. " +
              "Verifique se o backend está em execução.",
          );
        }
      } finally {
        setCarregando(false);
        setCarregandoAvistamentos(false);
      }
    }

    carregarDados();
  }, [id, navegar]);

  function sair() {
    localStorage.removeItem("mypetfound_token");

    navegar("/", {
      replace: true,
    });
  }

  function formatarData(dataHora) {
    if (!dataHora) {
      return "Data não informada";
    }

    return new Date(dataHora).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  function abrirMapa(avistamento) {
    const latitude = avistamento.latitude;
    const longitude = avistamento.longitude;

    if (latitude === null || longitude === null) {
      return null;
    }

    if (latitude === undefined || longitude === undefined) {
      return null;
    }

    return `https://www.google.com/maps?q=${latitude},${longitude}`;
  }

  const ocorrenciaAtiva = ocorrencias.find(
    (ocorrencia) =>
      ocorrencia.tipo === "DESAPARECIMENTO" &&
      ocorrencia.status === "ATIVA",
  );

  async function marcarComoReencontrado() {
    if (!ocorrenciaAtiva || !animal) {
      setErroOcorrencia(
        "Não foi encontrada uma ocorrência ativa para este animal.",
      );
      return;
    }

    const confirmou = window.confirm(
      `Você confirma que ${animal.nome} foi reencontrado?\n\n` +
        "O anúncio deixará de aparecer publicamente e será " +
        "removido do mapa de animais perdidos.",
    );

    if (!confirmou) {
      return;
    }

    try {
      setMarcandoReencontrado(true);
      setErroOcorrencia("");
      setMensagemSucesso("");

      const resposta = await api.post(
        `/ocorrencias/${ocorrenciaAtiva.id}/marcar-reencontrado/`,
      );

      setOcorrencias((ocorrenciasAtuais) =>
        ocorrenciasAtuais.map((ocorrencia) =>
          ocorrencia.id === ocorrenciaAtiva.id
            ? resposta.data.ocorrencia
            : ocorrencia,
        ),
      );

      setAnimal((animalAtual) => ({
        ...animalAtual,
        status: "REENCONTRADO",
        status_nome: "Reencontrado",
      }));

      setMensagemSucesso(
        resposta.data.mensagem ||
          `${animal.nome} foi marcado como reencontrado.`,
      );
    } catch (error) {
      console.error(
        "Erro ao marcar animal como reencontrado:",
        error,
      );

      setErroOcorrencia(
        error.response?.data?.detail ||
          error.response?.data?.mensagem ||
          "Não foi possível encerrar a ocorrência. Tente novamente.",
      );
    } finally {
      setMarcandoReencontrado(false);
    }
  }

  if (carregando) {
    return (
      <main className="pagina-gerenciar-animal">
        <section className="estado-gerenciar">
          <span className="carregador-gerenciar" aria-hidden="true" />

          <p>Carregando dados do animal...</p>
        </section>
      </main>
    );
  }

  if (erro || !animal) {
    return (
      <main className="pagina-gerenciar-animal">
        <section className="estado-gerenciar estado-erro-gerenciar">
          <span aria-hidden="true">⚠️</span>

          <h1>Não foi possível abrir este animal</h1>

          <p>
            {erro ||
              "Não foi possível carregar os dados do animal."}
          </p>

          <Link
            className="botao-voltar-gerenciar"
            to="/meus-animais"
          >
            Voltar para meus animais
          </Link>
        </section>
      </main>
    );
  }

  const statusClasse = (
    animal.status || "CADASTRADO"
  ).toLowerCase();

  return (
    <main className="pagina-gerenciar-animal">
      <header className="cabecalho-gerenciar">
        <Link className="logo-gerenciar" to="/">
          <span aria-hidden="true">🐾</span>
          MyPetFound
        </Link>

        <div className="acoes-cabecalho-gerenciar">
          <Link
            className="link-voltar-gerenciar"
            to="/meus-animais"
          >
            ← Meus animais
          </Link>

          <button
            className="botao-sair-gerenciar"
            type="button"
            onClick={sair}
          >
            Sair
          </button>
        </div>
      </header>

      <section className="titulo-gerenciar">
        <div>
          <p className="tag-gerenciar">
            Área do tutor
          </p>

          <h1>Gerenciar {animal.nome}</h1>

          <p>
            Consulte os dados do seu pet e acompanhe ocorrências e
            avistamentos enviados pela comunidade.
          </p>
        </div>

        <span
          className={`status-gerenciar status-${statusClasse}`}
        >
          {animal.status_nome || animal.status || "Cadastrado"}
        </span>
      </section>

      <section className="grid-gerenciar-animal">
        <article className="card-perfil-animal">
          <div className="foto-perfil-animal">
            {animal.foto ? (
              <img
                src={animal.foto}
                alt={`Foto de ${animal.nome}`}
              />
            ) : (
              <span aria-hidden="true">🐾</span>
            )}
          </div>

          <div className="dados-perfil-animal">
            <h2>{animal.nome}</h2>

            <p>
              {animal.especie_nome || animal.especie} ·{" "}
              {animal.porte_nome || animal.porte}
            </p>

            <button
              className="botao-editar-animal"
              type="button"
              disabled
              title="A edição de dados será implementada em breve."
            >
              Editar dados do animal
            </button>
          </div>
        </article>

        <article className="card-caracteristicas">
          <div className="titulo-card-gerenciar">
            <div>
              <p className="subtitulo-card-gerenciar">
                Identificação
              </p>

              <h2>Características</h2>
            </div>

            <span aria-hidden="true">🐾</span>
          </div>

          <dl className="lista-caracteristicas">
            <div>
              <dt>Espécie</dt>

              <dd>
                {animal.especie_nome ||
                  animal.especie ||
                  "Não informada"}
              </dd>
            </div>

            <div>
              <dt>Raça</dt>

              <dd>{animal.raca || "Não informada"}</dd>
            </div>

            <div>
              <dt>Porte</dt>

              <dd>
                {animal.porte_nome ||
                  animal.porte ||
                  "Não informado"}
              </dd>
            </div>

            <div>
              <dt>Cor predominante</dt>

              <dd>{animal.cor || "Não informada"}</dd>
            </div>
          </dl>

          {animal.descricao && (
            <div className="descricao-gerenciar-animal">
              <h3>Características adicionais</h3>

              <p>{animal.descricao}</p>
            </div>
          )}
        </article>
      </section>

      <section className="secao-ocorrencias-gerenciar">
        <div className="cabecalho-secao-gerenciar">
          <div>
            <p className="tag-gerenciar">
              Segurança e acompanhamento
            </p>

            <h2>Ocorrências e avistamentos</h2>

            <p>
              Quando um pet desaparece, registre uma ocorrência para que ele
              seja exibido publicamente e a comunidade possa enviar
              avistamentos.
            </p>
          </div>
        </div>

        {ocorrenciaAtiva ? (
          <article className="card-ocorrencia-ativa">
            <div className="icone-ocorrencia-ativa" aria-hidden="true">
              ⚠️
            </div>

            <div className="conteudo-ocorrencia-ativa">
              <p className="tag-ocorrencia-ativa">
                Anúncio público ativo
              </p>

              <h3>{animal.nome} está desaparecido</h3>

              <p>
                Último local informado:{" "}
                <strong>
                  {ocorrenciaAtiva.localidade || "Não informado"}
                </strong>
              </p>

              <p>
                Data do desaparecimento:{" "}
                <strong>
                  {formatarData(ocorrenciaAtiva.data_hora)}
                </strong>
              </p>

              {ocorrenciaAtiva.descricao && (
                <p className="descricao-ocorrencia-ativa">
                  {ocorrenciaAtiva.descricao}
                </p>
              )}
            </div>

            <button
              className="botao-marcar-reencontrado"
              type="button"
              onClick={marcarComoReencontrado}
              disabled={marcandoReencontrado}
            >
              {marcandoReencontrado
                ? "Encerrando..."
                : "Marcar como reencontrado"}
            </button>
          </article>
        ) : (
          <article className="card-ocorrencia-vazia">
            <div className="icone-ocorrencia-vazia" aria-hidden="true">
              🔎
            </div>

            <div>
              <h3>Nenhuma ocorrência ativa</h3>

              <p>
                {animal.nome} não possui um anúncio de desaparecimento ativo
                no momento.
              </p>
            </div>

            <Link
              className="botao-registrar-desaparecimento"
              to={`/meus-animais/${animal.id}/desaparecimento`}
            >
              Registrar desaparecimento
            </Link>
          </article>
        )}

        {mensagemSucesso && (
          <p className="mensagem-sucesso-ocorrencia" role="status">
            ✓ {mensagemSucesso}
          </p>
        )}

        {erroOcorrencia && (
          <p className="mensagem-erro-ocorrencia" role="alert">
            ⚠️ {erroOcorrencia}
          </p>
        )}
      </section>

      <section className="secao-avistamentos">
        <div className="cabecalho-secao-avistamentos">
          <div>
            <p className="tag-gerenciar">
              Informações da comunidade
            </p>

            <h2>Avistamentos recebidos</h2>

            <p>
              Veja as informações enviadas por pessoas que podem ter visto
              {` ${animal.nome}`}.
            </p>
          </div>

          {!carregandoAvistamentos && (
            <span
              className="contador-avistamentos"
              title="Quantidade de avistamentos recebidos"
            >
              {avistamentos.length}
            </span>
          )}
        </div>

        {carregandoAvistamentos && (
          <div className="estado-avistamentos">
            <span
              className="carregador-gerenciar"
              aria-hidden="true"
            />

            <p>Carregando avistamentos...</p>
          </div>
        )}

        {!carregandoAvistamentos && erroAvistamentos && (
          <div className="estado-avistamentos estado-erro-avistamentos">
            <span aria-hidden="true">⚠️</span>

            <p>{erroAvistamentos}</p>
          </div>
        )}

        {!carregandoAvistamentos &&
          !erroAvistamentos &&
          avistamentos.length === 0 && (
            <div className="estado-avistamentos">
              <span aria-hidden="true">👀</span>

              <div>
                <h3>Nenhum avistamento recebido</h3>

                <p>
                  Quando alguém informar que viu {animal.nome}, os dados
                  aparecerão nesta área.
                </p>
              </div>
            </div>
          )}

        {!carregandoAvistamentos &&
          !erroAvistamentos &&
          avistamentos.length > 0 && (
            <div className="lista-avistamentos">
              {avistamentos.map((avistamento) => {
                const linkMapa = abrirMapa(avistamento);

                return (
                  <article
                    className="card-avistamento"
                    key={avistamento.id}
                  >
                    {avistamento.foto ? (
                      <img
                        className="foto-avistamento"
                        src={avistamento.foto}
                        alt="Foto enviada no avistamento"
                      />
                    ) : (
                      <div
                        className="foto-avistamento-sem-imagem"
                        aria-hidden="true"
                      >
                        👀
                      </div>
                    )}

                    <div className="conteudo-avistamento">
                      <div className="topo-avistamento">
                        <div>
                          <p className="tag-avistamento">
                            Avistamento
                          </p>

                          <h3>
                            {avistamento.localidade ||
                              "Local não informado"}
                          </h3>
                        </div>

                        <time dateTime={avistamento.data_hora}>
                          {formatarData(avistamento.data_hora)}
                        </time>
                      </div>

                      {avistamento.descricao && (
                        <p className="descricao-avistamento">
                          {avistamento.descricao}
                        </p>
                      )}

                      {(avistamento.nome_contato ||
                        avistamento.telefone_contato) && (
                        <div className="contato-avistamento">
                          <strong>Contato:</strong>{" "}
                          {avistamento.nome_contato ||
                            "Não informado"}

                          {avistamento.telefone_contato &&
                            ` · ${avistamento.telefone_contato}`}
                        </div>
                      )}

                      {linkMapa && (
                        <a
                          className="link-mapa-avistamento"
                          href={linkMapa}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Abrir localização no mapa →
                        </a>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
      </section>

      <section className="aviso-privacidade-gerenciar">
        <span aria-hidden="true">🔒</span>

        <p>
          Seus dados pessoais permanecem protegidos. Informações de contato
          de pessoas que enviarem avistamentos serão exibidas somente para
          você, tutor responsável pelo animal.
        </p>
      </section>
    </main>
  );
}

export default GerenciarAnimal;