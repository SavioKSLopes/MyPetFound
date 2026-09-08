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

  useEffect(() => {
    async function carregarAnimal() {
      try {
        const response = await api.get(`/animais/${id}/`);

        setAnimal(response.data);
      } catch (error) {
        console.error("Erro ao carregar animal:", error);

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

        setErro(
          "Não foi possível carregar os dados do animal. " +
          "Verifique se o backend está em execução.",
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarAnimal();
  }, [id, navegar]);

  function sair() {
    localStorage.removeItem("mypetfound_token");

    navegar("/", {
      replace: true,
    });
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
              "Não foi possível carregar os dados deste animal."}
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

        <article className="card-ocorrencia-vazia">
          <div className="icone-ocorrencia-vazia" aria-hidden="true">
            🔎
          </div>

          <div>
            <h3>Nenhuma ocorrência ativa</h3>

            <p>
              {animal.nome} não possui um anúncio de desaparecimento ativo no
              momento.
            </p>
          </div>

          <Link
            className="botao-registrar-desaparecimento"
            to={`/meus-animais/${animal.id}/desaparecimento`}
          >
            Registrar desaparecimento
          </Link>
        </article>
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