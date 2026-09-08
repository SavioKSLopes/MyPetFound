import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { api } from "../services/api";
import "./MeusAnimais.css";


function MeusAnimais() {
  const navegar = useNavigate();

  const [animais, setAnimais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarAnimais() {
      try {
        const response = await api.get("/animais/");

        setAnimais(response.data);
      } catch (error) {
        console.error("Erro ao carregar animais:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("mypetfound_token");

          navegar("/entrar", {
            replace: true,
          });

          return;
        }

        setErro(
          "Não foi possível carregar seus animais. " +
          "Verifique se o backend está em execução.",
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarAnimais();
  }, [navegar]);

  function sair() {
    localStorage.removeItem("mypetfound_token");

    navegar("/", {
      replace: true,
    });
  }

  return (
    <main className="pagina-meus-animais">
      <header className="cabecalho-painel">
        <Link className="logo-painel" to="/">
          <span aria-hidden="true">🐾</span>
          MyPetFound
        </Link>

        <div className="acoes-cabecalho-painel">
          <Link className="link-pagina-publica" to="/">
            Ver animais perdidos
          </Link>

          <button
            className="botao-sair"
            type="button"
            onClick={sair}
          >
            Sair
          </button>
        </div>
      </header>

      <section className="intro-painel">
        <div>
          <p className="tag-painel">
            Área do tutor
          </p>

          <h1>Meus animais</h1>

          <p>
            Cadastre seus pets, acompanhe ocorrências e veja os avistamentos
            recebidos pela comunidade.
          </p>
        </div>

        <Link
          className="botao-cadastrar-animal"
          to="/meus-animais/novo"
        >
          <span aria-hidden="true">+</span>
          Cadastrar animal
        </Link>
      </section>

      {carregando && (
        <section className="estado-painel">
          <span className="carregador" aria-hidden="true" />

          <p>Carregando seus animais...</p>
        </section>
      )}

      {!carregando && erro && (
        <section className="estado-painel estado-erro">
          <span aria-hidden="true">⚠️</span>

          <h2>Não foi possível carregar seus animais</h2>

          <p>{erro}</p>

          <button
            className="botao-tentar-novamente"
            type="button"
            onClick={() => window.location.reload()}
          >
            Tentar novamente
          </button>
        </section>
      )}

      {!carregando && !erro && animais.length === 0 && (
        <section className="estado-painel estado-vazio-painel">
          <span aria-hidden="true">🐾</span>

          <h2>Você ainda não cadastrou nenhum animal</h2>

          <p>
            Cadastre seu pet para manter os dados organizados e conseguir
            criar um anúncio rapidamente, caso ele desapareça.
          </p>

          <Link
           className="botao-cadastrar-vazio"
           to="/meus-animais/novo"
          >
           Cadastrar meu primeiro animal
          </Link>
        </section>
      )}

      {!carregando && !erro && animais.length > 0 && (
        <section className="grid-meus-animais">
          {animais.map((animal) => (
            <article className="card-meu-animal" key={animal.id}>
              <div className="foto-meu-animal">
                {animal.foto ? (
                  <img
                    src={animal.foto}
                    alt={`Foto de ${animal.nome}`}
                  />
                ) : (
                  <span aria-hidden="true">🐾</span>
                )}
              </div>

              <div className="conteudo-meu-animal">
                <div className="cabecalho-card-animal">
                  <span
                    className={`status-painel status-${(
                      animal.status || "CADASTRADO"
                    ).toLowerCase()}`}
                  >
                    {animal.status_nome || animal.status || "Cadastrado"}
                  </span>
                </div>

                <h2>{animal.nome}</h2>

                <p className="tipo-meu-animal">
                  {animal.especie_nome || animal.especie} ·{" "}
                  {animal.porte_nome || animal.porte}
                </p>

                <p className="detalhes-meu-animal">
                  {animal.raca || "Raça não informada"}
                  {animal.cor ? ` · ${animal.cor}` : ""}
                </p>

                <button
                  className="botao-gerenciar-animal"
                  type="button"
                  disabled
                  title="A página de gerenciamento será implementada em breve."
                >
                  Gerenciar animal
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

export default MeusAnimais;