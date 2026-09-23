import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../../services/api.js";
import "./BuscarAnimais.css";

const filtrosIniciais = {
  busca: "",
  especie: "",
  porte: "",
  cor: "",
  localidade: "",
};

function BuscarAnimais() {
  const [filtros, setFiltros] = useState(filtrosIniciais);
  const [animais, setAnimais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [buscaRealizada, setBuscaRealizada] = useState(false);

  useEffect(() => {
    carregarAnimais();
  }, []);

  async function carregarAnimais(filtrosAtuais = filtros) {
    try {
      setCarregando(true);
      setErro("");

      const params = {};

      Object.entries(filtrosAtuais).forEach(([chave, valor]) => {
        if (valor.trim()) {
          params[chave] = valor.trim();
        }
      });

      const resposta = await api.get(
        "/publico/animais-perdidos/",
        {
          params,
        },
      );

      const dados = Array.isArray(resposta.data)
        ? resposta.data
        : resposta.data.results || [];

      setAnimais(dados);
    } catch (error) {
      console.error("Erro ao buscar animais perdidos:", error);

      setErro(
        "Não foi possível carregar os animais perdidos. " +
          "Tente novamente em alguns instantes.",
      );
    } finally {
      setCarregando(false);
    }
  }

  function atualizarFiltro(event) {
    const { name, value } = event.target;

    setFiltros((filtrosAtuais) => ({
      ...filtrosAtuais,
      [name]: value,
    }));
  }

  function buscar(event) {
    event.preventDefault();

    setBuscaRealizada(true);
    carregarAnimais(filtros);
  }

  function limparFiltros() {
    setFiltros(filtrosIniciais);
    setBuscaRealizada(false);
    carregarAnimais(filtrosIniciais);
  }

  function formatarData(dataHora) {
    if (!dataHora) {
      return "Data não informada";
    }

    return new Date(dataHora).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  return (
    <main className="pagina-buscar-animais">
      <header className="cabecalho-buscar-animais">
        <Link className="logo-buscar-animais" to="/">
          <span aria-hidden="true">🐾</span>
          MyPetFound
        </Link>

        <nav
          className="navegacao-buscar-animais"
          aria-label="Navegação principal"
        >
          <Link to="/">Início</Link>

          <Link to="/mapa-animais-perdidos">
            Ver mapa
          </Link>
        </nav>
      </header>

      <section className="introducao-buscar-animais">
        <p className="tag-buscar-animais">
          Busca comunitária
        </p>

        <h1>Encontre animais perdidos</h1>

        <p>
          Filtre os anúncios por características e região para ajudar
          um pet a voltar para casa.
        </p>
      </section>

      <section
        className="card-filtros-animais"
        aria-labelledby="titulo-filtros"
      >
        <div className="cabecalho-filtros-animais">
          <div>
            <h2 id="titulo-filtros">
              Filtre sua busca
            </h2>

            <p>
              Informe uma ou mais características do animal que você
              procura.
            </p>
          </div>

          <span aria-hidden="true">🔎</span>
        </div>

        <form
          className="formulario-filtros-animais"
          onSubmit={buscar}
        >
          <label className="campo-busca-largo">
            Nome, raça, cor ou característica
            <input
              type="search"
              name="busca"
              value={filtros.busca}
              onChange={atualizarFiltro}
              placeholder="Ex.: Luna, siamês, cicatriz, preto"
            />
          </label>

          <label>
            Espécie
            <select
              name="especie"
              value={filtros.especie}
              onChange={atualizarFiltro}
            >
              <option value="">Todas as espécies</option>
              <option value="CACHORRO">Cachorro</option>
              <option value="GATO">Gato</option>
              <option value="OUTRO">Outro</option>
            </select>
          </label>

          <label>
            Porte
            <select
              name="porte"
              value={filtros.porte}
              onChange={atualizarFiltro}
            >
              <option value="">Todos os portes</option>
              <option value="PEQUENO">Pequeno</option>
              <option value="MEDIO">Médio</option>
              <option value="GRANDE">Grande</option>
            </select>
          </label>

          <label>
            Cor predominante
            <input
              type="text"
              name="cor"
              value={filtros.cor}
              onChange={atualizarFiltro}
              placeholder="Ex.: Caramelo"
            />
          </label>

          <label>
            Região ou localidade
            <input
              type="text"
              name="localidade"
              value={filtros.localidade}
              onChange={atualizarFiltro}
              placeholder="Ex.: Cerama, Guanambi"
            />
          </label>

          <div className="acoes-filtros-animais">
            <button
              className="botao-limpar-filtros"
              type="button"
              onClick={limparFiltros}
            >
              Limpar filtros
            </button>

            <button
              className="botao-buscar-animais"
              type="submit"
            >
              Buscar animais
            </button>
          </div>
        </form>
      </section>

      <section
        className="resultados-busca-animais"
        aria-live="polite"
      >
        <div className="cabecalho-resultados-animais">
          <div>
            <p className="tag-buscar-animais">
              Anúncios ativos
            </p>

            <h2>
              {carregando
                ? "Buscando animais..."
                : `${animais.length} ${
                    animais.length === 1
                      ? "animal encontrado"
                      : "animais encontrados"
                  }`}
            </h2>
          </div>

          {buscaRealizada && !carregando && (
            <span className="status-filtro-aplicado">
              Filtros aplicados
            </span>
          )}
        </div>

        {carregando && (
          <div className="estado-busca-animais">
            <span
              className="carregador-buscar-animais"
              aria-hidden="true"
            />

            <p>Carregando anúncios de animais perdidos...</p>
          </div>
        )}

        {!carregando && erro && (
          <div
            className="estado-busca-animais estado-erro-busca"
            role="alert"
          >
            <span aria-hidden="true">⚠️</span>

            <div>
              <h3>Não foi possível concluir a busca</h3>

              <p>{erro}</p>
            </div>

            <button
              className="botao-tentar-novamente"
              type="button"
              onClick={() => carregarAnimais()}
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!carregando && !erro && animais.length === 0 && (
          <div className="estado-busca-animais">
            <span aria-hidden="true">🐾</span>

            <div>
              <h3>Nenhum animal encontrado</h3>

              <p>
                Tente remover algum filtro ou pesquisar por outra
                característica.
              </p>
            </div>

            <button
              className="botao-tentar-novamente"
              type="button"
              onClick={limparFiltros}
            >
              Limpar filtros
            </button>
          </div>
        )}

        {!carregando && !erro && animais.length > 0 && (
          <div className="grid-resultados-animais">
            {animais.map((animal) => (
              <article
                className="card-resultado-animal"
                key={animal.id}
              >
                <div className="foto-resultado-animal">
                  {animal.foto ? (
                    <img
                      src={animal.foto}
                      alt={`Foto de ${animal.nome}`}
                    />
                  ) : (
                    <span aria-hidden="true">🐾</span>
                  )}

                  <span className="selo-perdido-animal">
                    Desaparecido
                  </span>
                </div>

                <div className="conteudo-resultado-animal">
                  <div className="topo-resultado-animal">
                    <div>
                      <h3>{animal.nome}</h3>

                      <p>
                        {animal.especie_nome || animal.especie} ·{" "}
                        {animal.porte_nome || animal.porte}
                      </p>
                    </div>

                    <span aria-hidden="true">🔎</span>
                  </div>

                  <dl className="dados-resultado-animal">
                    <div>
                      <dt>Raça</dt>

                      <dd>{animal.raca || "Não informada"}</dd>
                    </div>

                    <div>
                      <dt>Cor</dt>

                      <dd>{animal.cor || "Não informada"}</dd>
                    </div>

                    <div className="dado-localidade-animal">
                      <dt>Último local informado</dt>

                      <dd>
                        {animal.localidade || "Não informado"}
                      </dd>
                    </div>
                  </dl>

                  <p className="data-desaparecimento-animal">
                    Desaparecido em{" "}
                    {formatarData(animal.data_desaparecimento)}
                  </p>

                  <Link
                    className="botao-ver-detalhes-animal"
                    to={`/animais/${animal.id}`}
                  >
                    Ver detalhes e ajudar
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="aviso-buscar-animais">
        <span aria-hidden="true">💙</span>

        <p>
          Encontrou um animal parecido? Abra os detalhes do anúncio e
          envie um avistamento para ajudar o tutor a localizá-lo.
        </p>
      </section>
    </main>
  );
}

export default BuscarAnimais;