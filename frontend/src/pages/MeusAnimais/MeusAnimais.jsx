import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import AnimalCard from "../../components/animal/AnimalCard";
import AnimalImagem from "../../components/animal/AnimalImagem";
import AnimalStatus from "../../components/animal/AnimalStatus";
import LayoutTutor from "../../components/layout/LayoutTutor";
import EstadoTela from "../../components/ui/EstadoTela";
import SecaoCabecalho from "../../components/ui/SecaoCabecalho";
import { animalEstaDesaparecido, obterNomeEspecie, obterNomePorte } from "../../utils/animal.js";
import useAuth from "../../hooks/useAuth.js";
import { listarMeusAnimais } from "../../services/animaisService.js";
import "./MeusAnimais.css";

function MeusAnimais() {
  const { sair } = useAuth();

  const [animais, setAnimais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [recarregar, setRecarregar] = useState(0);

  useEffect(() => {
    async function carregarAnimais() {
      setCarregando(true);
      setErro("");

      try {
        const response = await listarMeusAnimais();

        setAnimais(response.data);
      } catch (error) {
        console.error("Erro ao carregar animais:", error);

        if (error.response?.status === 401) {
          sair("/entrar");

          return;
        }

        setErro(
          "Não foi possível carregar seus animais. " +
            "Tente novamente em alguns instantes.",
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarAnimais();
  }, [sair, recarregar]);

  return (
    <LayoutTutor className="pagina-meus-animais">

      <SecaoCabecalho
        etiqueta="Área do tutor"
        titulo="Meus animais"
        tituloAs="h1"
        descricao="Cadastre seus pets, acompanhe ocorrências e veja os avistamentos recebidos pela comunidade."
        className="intro-painel"
        conteudoClassName="conteudo-intro-painel"
        etiquetaClassName="tag-painel"
        acao={(
          <Link className="botao-cadastrar-animal" to="/meus-animais/novo">
            <span aria-hidden="true">+</span>
            Cadastrar animal
          </Link>
        )}
      />

      {carregando && (
        <EstadoTela tipo="carregando" className="estado-painel">
          <span className="carregador" aria-hidden="true" />
          <p>Carregando seus animais...</p>
        </EstadoTela>
      )}

      {!carregando && erro && (
        <EstadoTela tipo="erro" className="estado-painel estado-erro">
          <span aria-hidden="true">⚠️</span>

          <h2>Não foi possível carregar seus animais</h2>

          <p>{erro}</p>

          <button
            className="botao-tentar-novamente"
            type="button"
            onClick={() => setRecarregar((valor) => valor + 1)}
          >
            Tentar novamente
          </button>
        </EstadoTela>
      )}

      {!carregando && !erro && animais.length === 0 && (
        <EstadoTela tipo="vazio" className="estado-painel estado-vazio-painel">
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
        </EstadoTela>
      )}

      {!carregando && !erro && animais.length > 0 && (
        <section className="grid-meus-animais">
          {animais.map((animal) => {
            const desaparecido = animalEstaDesaparecido(animal);

            return (
              <AnimalCard
                animal={animal}
                variant="tutor"
                className={`card-meu-animal${
                  desaparecido ? " card-meu-animal-perdido" : ""
                }`}
                key={animal.id}
              >
                <AnimalImagem src={animal.foto} nome={animal.nome} variant="card" />

                <div className="conteudo-meu-animal">
                  <div className="cabecalho-card-animal">
                    <AnimalStatus
                      status={animal.status}
                      statusNome={animal.status_nome}
                      desaparecido={desaparecido}
                      className="status-painel"
                    />
                  </div>

                  <h2>{animal.nome}</h2>

                  <p className="tipo-meu-animal">
                    {obterNomeEspecie(animal)} · {obterNomePorte(animal)}
                  </p>

                  <p className="detalhes-meu-animal">
                    {animal.raca || "Raça não informada"}
                    {animal.cor ? ` · ${animal.cor}` : ""}
                  </p>

                  {desaparecido && (
                    <Link
                      className="link-anuncio-publico"
                      to={`/animais/${animal.id}`}
                    >
                      Ver anúncio público
                    </Link>
                  )}

                  <div className="acoes-card-animal">
                    {!desaparecido && (
                      <Link
                        className="botao-registrar-desaparecimento"
                        to={`/meus-animais/${animal.id}/desaparecimento`}
                      >
                        Registrar desaparecimento
                      </Link>
                    )}

                    <Link
                      className="botao-gerenciar-animal"
                      to={`/meus-animais/${animal.id}`}
                    >
                      Gerenciar animal
                    </Link>
                  </div>
                </div>
              </AnimalCard>
            );
          })}
        </section>
      )}
    </LayoutTutor>
  );
}

export default MeusAnimais;
