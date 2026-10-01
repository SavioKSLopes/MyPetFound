import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import LayoutTutor from "../../components/layout/LayoutTutor";
import AnimalCard from "../../components/animal/AnimalCard";
import AnimalImagem from "../../components/animal/AnimalImagem";
import AnimalStatus from "../../components/animal/AnimalStatus";
import EstadoTela from "../../components/ui/EstadoTela";
import { obterAnimalTutor, obterQrCodeAnimal } from "../../services/animaisService.js";
import { listarAvistamentos } from "../../services/avistamentosService.js";
import { listarOcorrencias, marcarOcorrenciaComoReencontrada } from "../../services/ocorrenciasService.js";
import { formatarDataHora } from "../../utils/formatadores.js";
import { obterNomeEspecie, obterNomePorte } from "../../utils/animal.js";
import useAuth from "../../hooks/useAuth.js";
import "./GerenciarAnimal.css";

function GerenciarAnimal() {
  const { id } = useParams();
  const { sair } = useAuth();

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

  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [carregandoQrCode, setCarregandoQrCode] = useState(false);
  const [erroQrCode, setErroQrCode] = useState("");

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
          obterAnimalTutor(id),
          listarAvistamentos(id),
          listarOcorrencias(id),
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
          sair("/entrar");

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

    return () => {
      setQrCodeUrl((urlAtual) => {
        if (urlAtual) {
          URL.revokeObjectURL(urlAtual);
        }

        return "";
      });
    };
  }, [id, sair]);

  function formatarData(dataHora) {
    if (!dataHora) {
      return "Data não informada";
    }

    return formatarDataHora(dataHora);
  }

  function abrirMapa(avistamento) {
    const { latitude, longitude } = avistamento;

    if (
      latitude === null ||
      latitude === undefined ||
      longitude === null ||
      longitude === undefined
    ) {
      return null;
    }

    return `https://www.google.com/maps?q=${latitude},${longitude}`;
  }

  async function gerarQrCode() {
    if (!animal) {
      return;
    }

    setCarregandoQrCode(true);
    setErroQrCode("");

    try {
      const resposta = await obterQrCodeAnimal(animal.id);

      const novaUrl = URL.createObjectURL(resposta.data);

      setQrCodeUrl((urlAnterior) => {
        if (urlAnterior) {
          URL.revokeObjectURL(urlAnterior);
        }

        return novaUrl;
      });
    } catch (error) {
      console.error("Erro ao gerar QR Code:", error);

      setErroQrCode(
        "Não foi possível gerar o QR Code. Tente novamente.",
      );
    } finally {
      setCarregandoQrCode(false);
    }
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

      const resposta = await marcarOcorrenciaComoReencontrada(ocorrenciaAtiva.id);

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
      <LayoutTutor className="pagina-gerenciar-animal">
          <EstadoTela tipo="carregando" className="estado-gerenciar">
          <span className="carregador-gerenciar" aria-hidden="true" />

          <p>Carregando dados do animal...</p>
        </EstadoTela>
      </LayoutTutor>
    );
  }

  if (erro || !animal) {
    return (
      <LayoutTutor className="pagina-gerenciar-animal">
          <EstadoTela tipo="erro" className="estado-gerenciar estado-erro-gerenciar">
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
        </EstadoTela>
      </LayoutTutor>
    );
  }

  const nomeArquivoQrCode = `qrcode-${animal.nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replaceAll(" ", "-")}.png`;

  return (
    <LayoutTutor className="pagina-gerenciar-animal">
      <div className="acoes-contextuais-gerenciar">
        <Link className="link-voltar-gerenciar" to="/meus-animais">
          ← Meus animais
        </Link>
      </div>

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

        <AnimalStatus
          status={animal.status}
          statusNome={animal.status_nome}
          className="status-gerenciar"
        />
      </section>

      <section className="grid-gerenciar-animal">
        <AnimalCard animal={animal} variant="perfil" className="card-perfil-animal">
          <AnimalImagem src={animal.foto} nome={animal.nome} className="foto-perfil-animal" />

          <div className="dados-perfil-animal">
            <h2>{animal.nome}</h2>

            <p>
              {obterNomeEspecie(animal)} · {obterNomePorte(animal)}
            </p>

            <Link
              className="botao-editar-animal"
              to={`/meus-animais/${animal.id}/editar`}
            >
              Editar dados do animal
            </Link>
          </div>
        </AnimalCard>

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

      <section className="secao-qrcode-gerenciar">
        <div className="cabecalho-secao-qrcode">
          <div>
            <p className="tag-gerenciar">
              Identificação rápida
            </p>

            <h2>QR Code de {animal.nome}</h2>

            <p>
              Gere um QR Code para imprimir e colocar na coleira do pet.
              Quem escanear será direcionado para a página pública do
              animal.
            </p>
          </div>
        </div>

        <div className="card-qrcode-gerenciar">
          <div className="conteudo-qrcode-gerenciar">
            <span className="icone-qrcode" aria-hidden="true">
              ▦
            </span>

            <div>
              <h3>Identificação digital do pet</h3>

              <p>
                O QR Code ajuda alguém a localizar o anúncio rapidamente
                caso encontre {animal.nome}.
              </p>
            </div>
          </div>

          <button
            className="botao-gerar-qrcode"
            type="button"
            onClick={gerarQrCode}
            disabled={carregandoQrCode}
          >
            {carregandoQrCode
              ? "Gerando QR Code..."
              : "Gerar QR Code"}
          </button>
        </div>

        {erroQrCode && (
          <p className="mensagem-erro-qrcode" role="alert">
            ⚠️ {erroQrCode}
          </p>
        )}

        {qrCodeUrl && (
          <div className="resultado-qrcode">
            <img
              src={qrCodeUrl}
              alt={`QR Code de ${animal.nome}`}
            />

            <div>
              <h3>QR Code pronto</h3>

              <p>
                Baixe a imagem e imprima para colocar na coleira ou na
                identificação de {animal.nome}.
              </p>

              <a
                className="botao-baixar-qrcode"
                href={qrCodeUrl}
                download={nomeArquivoQrCode}
              >
                Baixar QR Code
              </a>
            </div>
          </div>
        )}
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
          <EstadoTela tipo="carregando" className="estado-avistamentos">
            <span
              className="carregador-gerenciar"
              aria-hidden="true"
            />

            <p>Carregando avistamentos...</p>
          </EstadoTela>
        )}

        {!carregandoAvistamentos && erroAvistamentos && (
          <EstadoTela tipo="erro" className="estado-avistamentos estado-erro-avistamentos">
            <span aria-hidden="true">⚠️</span>

            <p>{erroAvistamentos}</p>
          </EstadoTela>
        )}

        {!carregandoAvistamentos &&
          !erroAvistamentos &&
          avistamentos.length === 0 && (
            <EstadoTela tipo="vazio" className="estado-avistamentos">
              <span aria-hidden="true">👀</span>

              <div>
                <h3>Nenhum avistamento recebido</h3>

                <p>
                  Quando alguém informar que viu {animal.nome}, os dados
                  aparecerão nesta área.
                </p>
              </div>
            </EstadoTela>
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
                      <AnimalImagem
                        className="foto-avistamento"
                        src={avistamento.foto}
                        nome={`avistamento de ${animal.nome}`}
                        alt="Foto enviada no avistamento"
                      />
                    ) : (
                      <div className="foto-avistamento-sem-imagem" aria-hidden="true">👀</div>
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
    </LayoutTutor>
  );
}

export default GerenciarAnimal;
