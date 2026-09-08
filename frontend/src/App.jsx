import { useEffect, useState } from "react";
import { Link, Route, Routes } from "react-router-dom";

import DetalhesAnimal from "./pages/DetalhesAnimal";
import { api } from "./services/api";
import "./App.css";

import Login from "./pages/Login";
import MeusAnimais from "./pages/MeusAnimais";
import RotaProtegida from "./components/RotaProtegida";
import CadastroAnimal from "./pages/CadastroAnimal";
import GerenciarAnimal from "./pages/GerenciarAnimal";
import RegistrarDesaparecimento from "./pages/RegistrarDesaparecimento";

function Home() {
  const [animais, setAnimais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarAnimaisPerdidos() {
      try {
        const response = await api.get("/publico/animais-perdidos/");

        setAnimais(response.data);
      } catch (error) {
        console.error("Erro ao carregar animais perdidos:", error);

        setErro(
          "Não foi possível carregar os animais perdidos. " +
          "Verifique se o backend está em execução.",
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarAnimaisPerdidos();
  }, []);

  return (
    <div className="pagina">
      <header className="cabecalho">
        <Link className="logo" to="/">
          <span aria-hidden="true">🐾</span>
          MyPetFound
        </Link>

        <nav className="navegacao" aria-label="Navegação principal">
          <a href="#animais-perdidos">Buscar pets</a>
          <a href="#como-funciona">Como funciona</a>

        <Link
          className="botao botao-secundario"
          to="/entrar"
        >
          Entrar
        </Link>

          <button className="botao botao-urgencia">
            Meu pet desapareceu
          </button>
        </nav>
      </header>

      <main>
        <section className="hero">
          <p className="tag">
            Uma rede de ajuda para Guanambi-BA
          </p>

          <h1>
            Perdeu seu pet?
            <br />
            A comunidade ajuda a encontrar.
          </h1>

          <p className="hero-texto">
            Cadastre seu animal, divulgue um desaparecimento e receba
            informações de pessoas que podem ajudar no reencontro.
          </p>

          <div className="hero-acoes">
            <button className="card-acao card-perdido">
              <span className="icone-acao" aria-hidden="true">
                🔎
              </span>

              <strong>Perdi meu pet</strong>

              <span>
                Registrar um desaparecimento
              </span>
            </button>

            <button className="card-acao card-encontrado">
              <span className="icone-acao" aria-hidden="true">
                🤝
              </span>

              <strong>Encontrei um pet</strong>

              <span>
                Ajudar a devolver ao tutor
              </span>
            </button>
          </div>
        </section>

        <section
          className="secao animais-perdidos"
          id="animais-perdidos"
        >
          <div className="secao-cabecalho">
            <div>
              <p className="tag">Ajude a comunidade</p>
              <h2>Animais perdidos em Guanambi</h2>
            </div>

            <button className="link-botao">
              Ver todos no mapa →
            </button>
          </div>

          {carregando && (
            <p className="mensagem">
              Carregando animais perdidos...
            </p>
          )}

          {!carregando && erro && (
            <p className="mensagem mensagem-erro">
              {erro}
            </p>
          )}

          {!carregando && !erro && animais.length === 0 && (
            <div className="estado-vazio">
              <span aria-hidden="true">🐾</span>

              <h3>Nenhum animal perdido no momento</h3>

              <p>
                Isso é uma boa notícia. Quando houver um anúncio ativo,
                ele aparecerá aqui.
              </p>
            </div>
          )}

          {!carregando && !erro && animais.length > 0 && (
            <div className="grid-animais">
              {animais.map((animal) => (
                <article className="card-animal" key={animal.id}>
                  <div className="foto-placeholder">
                    {animal.foto ? (
                      <img
                        src={animal.foto}
                        alt={`Foto de ${animal.nome}`}
                      />
                    ) : (
                      <span aria-hidden="true">🐾</span>
                    )}
                  </div>

                  <div className="conteudo-card">
                    <span className="status status-perdido">
                      <span aria-hidden="true">⚠</span>
                      Perdido
                    </span>

                    <h3>{animal.nome}</h3>

                    <p>
                      {animal.especie_nome} · {animal.porte_nome}
                    </p>

                    <p className="texto-secundario">
                      {animal.cor}
                      {animal.raca ? ` · ${animal.raca}` : ""}
                    </p>

                    <Link
                      className="botao-detalhes"
                      to={`/animais/${animal.id}`}
                    >
                      Ver detalhes
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="secao como-funciona" id="como-funciona">
          <p className="tag">Simples e rápido</p>

          <h2>Como funciona</h2>

          <div className="passos">
            <article className="passo">
              <span aria-hidden="true">1</span>

              <h3>Cadastre seu pet</h3>

              <p>
                Salve as características importantes do seu animal.
              </p>
            </article>

            <article className="passo">
              <span aria-hidden="true">2</span>

              <h3>Anuncie rapidamente</h3>

              <p>
                Se ele desaparecer, informe o último local onde foi visto.
              </p>
            </article>

            <article className="passo">
              <span aria-hidden="true">3</span>

              <h3>Receba avistamentos</h3>

              <p>
                A comunidade pode informar onde viu um animal parecido.
              </p>
            </article>
          </div>
        </section>

        <section className="seguranca">
          <span className="seguranca-icone" aria-hidden="true">
            🔒
          </span>

          <div>
            <h2>Seus dados protegidos</h2>

            <p>
              Seguimos a LGPD. Seu telefone e endereço não são exibidos
              publicamente sem sua autorização.
            </p>
          </div>
        </section>
      </main>

      <footer className="rodape">
        <p>
          © 2026 MyPetFound. Unindo pessoas, patinhas e esperança.
        </p>

        <nav aria-label="Links do rodapé">
          <a href="#sobre">Sobre</a>
          <a href="#privacidade">Privacidade</a>
          <a href="#contato">Contato</a>
        </nav>
      </footer>
    </div>
  );
}


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route
        path="/animais/:id"
        element={<DetalhesAnimal />}
      />

      <Route path="/entrar" element={<Login />} />

      <Route element={<RotaProtegida />}>
        <Route
          path="/meus-animais"
          element={<MeusAnimais />}
        />

        <Route
          path="/meus-animais/novo"
          element={<CadastroAnimal />}
        />
        <Route
          path="/meus-animais/:id"
          element={<GerenciarAnimal />}
        />
        <Route
          path="/meus-animais/:id/desaparecimento"
          element={<RegistrarDesaparecimento />}
        />
      </Route>

    </Routes>
  );
}

export default App;