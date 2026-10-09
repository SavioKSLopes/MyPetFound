import { useEffect, useState } from "react";
import { Link, Route, Routes } from "react-router-dom";

import LayoutPublico from "./components/layout/LayoutPublico.jsx";
import AnimalCard from "./components/animal/AnimalCard.jsx";
import AnimalImagem from "./components/animal/AnimalImagem.jsx";
import AnimalStatus from "./components/animal/AnimalStatus.jsx";
import EstadoTela from "./components/ui/EstadoTela.jsx";
import RotaProtegida from "./components/RotaProtegida.jsx";
import { buscarAnimais } from "./services/animaisService.js";

import BuscarAnimais from "./pages/BuscarAnimais/BuscarAnimais.jsx";
import CadastroAnimal from "./pages/CadastroAnimal/CadastroAnimal.jsx";
import CadastroUsuario from "./pages/CadastroUsuario/CadastroUsuario.jsx";
import DetalhesAnimal from "./pages/DetalhesAnimal/DetalhesAnimal.jsx";
import EditarAnimal from "./pages/EditarAnimal/EditarAnimal.jsx";
import EsqueciSenha from "./pages/EsqueciSenha/EsqueciSenha.jsx";
import GerenciarAnimal from "./pages/GerenciarAnimal/GerenciarAnimal.jsx";
import HistoricoAnimal from "./pages/HistoricoAnimal/HistoricoAnimal.jsx";
import IdentificacaoAnimal from "./pages/IdentificacaoAnimal/IdentificacaoAnimal.jsx";
import Login from "./pages/Login/Login.jsx";
import MapaAnimaisPerdidos from "./pages/MapaAnimaisPerdidos/MapaAnimaisPerdidos.jsx";
import Mensagens from "./pages/Mensagens/Mensagens.jsx";
import MeusAnimais from "./pages/MeusAnimais/MeusAnimais.jsx";
import RegistrarDesaparecimento from "./pages/RegistrarDesaparecimento/RegistrarDesaparecimento.jsx";
import RedefinirSenha from "./pages/RedefinirSenha/RedefinirSenha.jsx";

import "./App.css";

function Home() {
  const [animais, setAnimais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarAnimaisPerdidos() {
      try {
        const response = await buscarAnimais();

        const dados = Array.isArray(response.data)
          ? response.data
          : response.data.results || [];

        setAnimais(dados);
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
      <a href="#conteudo-principal" className="skip-link">
        Pular para o conteúdo principal
      </a>
      <LayoutPublico className="pagina-inicial">
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
            <Link
              className="card-acao card-perdido"
              to="/meus-animais"
            >
              <span className="icone-acao" aria-hidden="true">
                🔎
              </span>

              <strong>Perdi meu pet</strong>

              <span>
                Registrar um desaparecimento
              </span>
            </Link>

            <Link
              className="card-acao card-encontrado"
              to="/buscar"
            >
              <span className="icone-acao" aria-hidden="true">
                🤝
              </span>

              <strong>Encontrei um pet</strong>

              <span>
                Ajudar a devolver ao tutor
              </span>
            </Link>
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

            <div className="acoes-lista-animais">
              <Link className="link-botao" to="/buscar">
                <span className="icone-link-acao" aria-hidden="true">
                  🔎
                </span>

                Buscar com filtros
              </Link>

              <Link className="link-botao" to="/mapa">
                <span className="icone-link-acao" aria-hidden="true">
                  📍
                </span>

                Ver todos no mapa
              </Link>
            </div>
          </div>

          {carregando && (
            <EstadoTela tipo="carregando" className="mensagem">
              <p>Carregando animais perdidos...</p>
            </EstadoTela>
          )}

          {!carregando && erro && (
            <EstadoTela tipo="erro" className="mensagem mensagem-erro">
              {erro}
            </EstadoTela>
          )}

          {!carregando && !erro && animais.length === 0 && (
            <EstadoTela tipo="vazio" className="estado-vazio">
              <span aria-hidden="true">🐾</span>

              <h3>Nenhum animal perdido no momento</h3>

              <p>
                Isso é uma boa notícia. Quando houver um anúncio ativo,
                ele aparecerá aqui.
              </p>
            </EstadoTela>
          )}

          {!carregando && !erro && animais.length > 0 && (
            <div className="grid-animais">
              {animais.map((animal) => (
                <AnimalCard animal={animal} variant="publico" className="card-animal" key={animal.id}>
                  <AnimalImagem src={animal.foto} nome={animal.nome} variant="card" />

                  <div className="animal-card-conteudo">
                    <div className="animal-card-status">
                    <AnimalStatus status="PERDIDO" statusNome="Perdido" className="status status-perdido">
                      <span aria-hidden="true">⚠</span>
                      Perdido
                    </AnimalStatus>
                    </div>

                    <h3 className="animal-card-nome">{animal.nome}</h3>

                    <div className="animal-card-informacoes">
                      <p className="animal-card-linha">
                        {animal.especie_nome || animal.especie} · {animal.porte_nome || animal.porte}
                      </p>
                      <p className="animal-card-linha">
                        {animal.cor || "Cor não informada"} · {animal.raca || "Raça não informada"}
                      </p>
                    </div>

                    <div className="animal-card-acoes">
                      <Link className="animal-card-botao--detalhes" to={`/animais/${animal.id}`}>
                        Ver detalhes
                      </Link>
                    </div>
                  </div>
                </AnimalCard>
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
      </LayoutPublico>

      <footer className="rodape">
        <p>
          © 2026 MyPetFound. Unindo pessoas, patinhas e esperança.
        </p>

        <nav aria-label="Links do rodapé">
          <a href="#como-funciona">Como funciona</a>

          <Link to="/buscar">Buscar pets</Link>

          <Link to="/mapa">Mapa</Link>

          <Link to="/entrar">Entrar</Link>
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
        path="/buscar"
        element={<BuscarAnimais />}
      />

      <Route
        path="/animais/:id"
        element={<DetalhesAnimal />}
      />

      <Route
        path="/mapa"
        element={<MapaAnimaisPerdidos />}
      />

      <Route path="/entrar" element={<Login />} />

      <Route path="/esqueci-senha" element={<EsqueciSenha />} />

      <Route path="/redefinir-senha/:uid/:token" element={<RedefinirSenha />} />

      <Route path="/cadastro" element={<CadastroUsuario />} />

      <Route
        path="/identificacao/:codigo"
        element={<IdentificacaoAnimal />}
      />

      <Route element={<RotaProtegida />}>
        <Route path="/meus-animais/:id/historico" element={<HistoricoAnimal />} />
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
          path="/meus-animais/:id/editar"
          element={<EditarAnimal />}
        />

        <Route
          path="/meus-animais/:id/desaparecimento"
          element={<RegistrarDesaparecimento />}
        />

        <Route
          path="/mensagens"
          element={<Mensagens />}
        />
      </Route>
    </Routes>
  );
}

export default App;
