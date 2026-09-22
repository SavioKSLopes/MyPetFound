import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import ReportarAvistamento from "../ReportarAvistamento/ReportarAvistamento.jsx";
import { api } from "../../services/api.js";
import "./DetalhesAnimal.css";

function DetalhesAnimal() {
  const { id } = useParams();

  const [animal, setAnimal] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [formularioAberto, setFormularioAberto] = useState(false);

  useEffect(() => {
    async function carregarAnimal() {
      try {
        const response = await api.get(
          `/publico/animais-perdidos/${id}/`,
        );

        setAnimal(response.data);
      } catch (error) {
        console.error("Erro ao carregar animal:", error);

        setErro(
          "Não foi possível encontrar este animal ou o anúncio não está mais ativo.",
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarAnimal();
  }, [id]);

  if (carregando) {
    return (
      <main className="pagina-detalhes">
        <p className="mensagem-detalhes">
          Carregando informações do animal...
        </p>
      </main>
    );
  }

  if (erro || !animal) {
    return (
      <main className="pagina-detalhes">
        <section className="erro-detalhes">
          <h1>Não foi possível abrir o anúncio</h1>

          <p>
            {erro ||
              "Não foi possível encontrar este animal ou o anúncio não está mais ativo."}
          </p>

          <Link className="botao-voltar" to="/">
            Voltar para a página inicial
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="pagina-detalhes">
      <header className="cabecalho-detalhes">
        <Link className="logo-detalhes" to="/">
          <span aria-hidden="true">🐾</span>
          MyPetFound
        </Link>

        <Link className="voltar-link" to="/">
          ← Voltar para os animais perdidos
        </Link>
      </header>

      <section className="banner-perdido">
        <span aria-hidden="true">⚠️</span>

        <p>
          Este pet está desaparecido. Viu ele? Qualquer informação ajuda.
        </p>
      </section>

      <section className="conteudo-detalhes">
        <div className="foto-detalhes">
          {animal.foto ? (
            <img
              src={animal.foto}
              alt={`Foto de ${animal.nome}`}
            />
          ) : (
            <span aria-hidden="true">🐾</span>
          )}
        </div>

        <div className="informacoes-detalhes">
          <span className="status status-perdido">
            <span aria-hidden="true">⚠</span>
            Perdido
          </span>

          <h1>{animal.nome}</h1>

          <p className="descricao-curta">
            {animal.especie_nome} · {animal.porte_nome}
          </p>

          <section className="card-detalhes">
            <h2>Características</h2>

            <dl>
              <div>
                <dt>Espécie</dt>
                <dd>{animal.especie_nome || "Não informada"}</dd>
              </div>

              <div>
                <dt>Raça</dt>
                <dd>{animal.raca || "Não informada"}</dd>
              </div>

              <div>
                <dt>Porte</dt>
                <dd>{animal.porte_nome || "Não informado"}</dd>
              </div>

              <div>
                <dt>Cor</dt>
                <dd>{animal.cor || "Não informada"}</dd>
              </div>
            </dl>
          </section>

          {animal.descricao && (
            <section className="card-detalhes">
              <h2>Informações adicionais</h2>

              <p>{animal.descricao}</p>
            </section>
          )}

          <section className="card-avistamento">
            <div className="conteudo-avistamento-publico">
              <h2>Você viu este pet?</h2>

              <p>
                Informe onde e quando viu o animal. Sua colaboração pode ajudar
                este pet a voltar para casa.
              </p>
            </div>

            <button
              className="botao-avistamento"
              type="button"
              onClick={() => setFormularioAberto(true)}
            >
              Reportar avistamento
            </button>
          </section>

          <p className="aviso-privacidade">
            <span aria-hidden="true">🔒</span>
            Dados do tutor são protegidos e não são exibidos publicamente.
          </p>
        </div>
      </section>

      {formularioAberto && (
        <ReportarAvistamento
          animal={animal}
          aoFechar={() => setFormularioAberto(false)}
        />
      )}
    </main>
  );
}

export default DetalhesAnimal;