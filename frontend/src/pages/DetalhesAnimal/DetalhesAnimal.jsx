import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import ReportarAvistamento from "../ReportarAvistamento/ReportarAvistamento.jsx";
import LayoutPublico from "../../components/layout/LayoutPublico";
import AnimalImagem from "../../components/animal/AnimalImagem";
import AnimalStatus from "../../components/animal/AnimalStatus";
import CompartilharAnuncio from "../../components/animal/CompartilharAnuncio.jsx";
import FormularioContatoTutor from "../../components/mensagens/FormularioContatoTutor.jsx";
import Card from "../../components/ui/Card";
import EstadoTela from "../../components/ui/EstadoTela";
import { obterAnimalPublico } from "../../services/animaisService.js";
import "./DetalhesAnimal.css";

function DetalhesAnimal() {
  const { id } = useParams();

  const [animal, setAnimal] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [formularioAberto, setFormularioAberto] = useState(false);
  const [avisoAvistamentoEnviado, setAvisoAvistamentoEnviado] = useState("");
  const botaoReportarRef = useRef(null);
  const timerAvisoRef = useRef(null);

  useEffect(() => () => window.clearTimeout(timerAvisoRef.current), []);

  function fecharFormularioAvistamento() {
    setFormularioAberto(false);
    window.requestAnimationFrame(() => botaoReportarRef.current?.focus());
  }

  function mostrarAvisoAvistamento(texto) {
    window.clearTimeout(timerAvisoRef.current);
    setAvisoAvistamentoEnviado(texto);
    timerAvisoRef.current = window.setTimeout(() => {
      setAvisoAvistamentoEnviado("");
    }, 3500);
  }

  useEffect(() => {
    async function carregarAnimal() {
      try {
        const response = await obterAnimalPublico(id);

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
      <LayoutPublico className="pagina-detalhes">
        <EstadoTela tipo="carregando" className="mensagem-detalhes">
          Carregando informações do animal...
        </EstadoTela>
      </LayoutPublico>
    );
  }

  if (erro || !animal) {
    return (
      <LayoutPublico className="pagina-detalhes">
        <EstadoTela tipo="erro" className="erro-detalhes">
          <h1>Não foi possível abrir o anúncio</h1>

          <p>
            {erro ||
              "Não foi possível encontrar este animal ou o anúncio não está mais ativo."}
          </p>

          <Link className="botao-voltar" to="/">
            Voltar para a página inicial
          </Link>
        </EstadoTela>
      </LayoutPublico>
    );
  }

  return (
    <LayoutPublico className="pagina-detalhes">
      <div className="acoes-contextuais-detalhes">
        <Link className="voltar-link" to="/buscar">
          ← Voltar para os animais perdidos
        </Link>
      </div>

      <section className="banner-perdido">
        <span aria-hidden="true">⚠️</span>

        <p>
          Este pet está desaparecido. Viu ele? Qualquer informação ajuda.
        </p>
      </section>

      <section className="conteudo-detalhes">
        <AnimalImagem src={animal.foto} nome={animal.nome} className="foto-detalhes" />

        <div className="informacoes-detalhes">
          <AnimalStatus status="PERDIDO" statusNome="Perdido" className="status">
            <span aria-hidden="true">⚠</span>
            Perdido
          </AnimalStatus>

          <h1>{animal.nome}</h1>

          <p className="descricao-curta">
            {animal.especie_nome} · {animal.porte_nome}
          </p>

          <Card as="section" className="card-detalhes">
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
          </Card>

          {animal.descricao && (
            <Card as="section" className="card-detalhes">
              <h2>Informações adicionais</h2>

              <p>{animal.descricao}</p>
            </Card>
          )}

          <section className="detalhes-contato-publico" aria-label="Ações para ajudar">
            {animal.status !== "REENCONTRADO" ? (
              <section className="card-acao-avistamento">
                <div className="conteudo-acao-avistamento">
                  <h2>Você viu este pet?</h2>
                  <p>
                    Informe onde e quando viu o animal. Sua colaboração pode
                    ajudar este pet a voltar para casa.
                  </p>
                </div>
                <button
                  ref={botaoReportarRef}
                  type="button"
                  className="botao-reportar-avistamento"
                  onClick={() => setFormularioAberto(true)}
                >
                  Reportar avistamento
                </button>
              </section>
            ) : (
              <p className="aviso-animal-encerrado">
                Este animal já foi reencontrado e não está recebendo novos avisos.
              </p>
            )}

            <section className="detalhes-compartilhamento">
              <h2>Ajude a encontrar {animal.nome}</h2>
              <p>Compartilhe este anúncio com pessoas da região.</p>
              <CompartilharAnuncio animal={animal} />
            </section>
          </section>
        </div>
      </section>

      {formularioAberto && animal.status !== "REENCONTRADO" && (
        <ReportarAvistamento
          animal={animal}
          aoFechar={fecharFormularioAvistamento}
          aoConcluir={mostrarAvisoAvistamento}
        >
          <FormularioContatoTutor animalId={animal.id} />
        </ReportarAvistamento>
      )}

      {avisoAvistamentoEnviado && (
        <div className="toast-avistamento-sucesso" role="status" aria-live="polite">
          {avisoAvistamentoEnviado}
        </div>
      )}

    </LayoutPublico>
  );
}

export default DetalhesAnimal;
