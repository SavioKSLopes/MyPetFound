import { useEffect, useRef, useState } from "react";

import SeletorLocalizacao from "../../components/SeletorLocalizacao.jsx";
import FormularioContatoTutor from "../../components/mensagens/FormularioContatoTutor.jsx";
import { criarAvistamento } from "../../services/avistamentosService.js";
import "./ReportarAvistamento.css";

function ReportarAvistamento({ animal, aoFechar, aoConcluir }) {
  const [localidade, setLocalidade] = useState("");
  const [dataHora, setDataHora] = useState("");
  const [nomeContato, setNomeContato] = useState("");
  const [telefoneContato, setTelefoneContato] = useState("");
  const [foto, setFoto] = useState(null);
  const [localizacaoMapa, setLocalizacaoMapa] = useState(null);
  const [avistamentoRegistrado, setAvistamentoRegistrado] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [fechando, setFechando] = useState(false);
  const avistamentoCriadoRef = useRef(false);
  const timersRef = useRef([]);

  useEffect(() => () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }, []);

  const coordenadas = localizacaoMapa
    ? `${localizacaoMapa.latitude.toFixed(6)}, ${localizacaoMapa.longitude.toFixed(6)}`
    : "";
  const localizacaoTexto = localidade.trim() || coordenadas;

  function concluirComSucesso() {
    if (sucesso || fechando) return;
    setSucesso(true);
    timersRef.current.push(window.setTimeout(() => setFechando(true), 900));
    timersRef.current.push(window.setTimeout(() => {
      aoFechar();
      aoConcluir?.("Avistamento registrado e tutor avisado.");
    }, 1120));
  }

  async function registrarAvistamentoAntesDoAviso({ mensagem }) {
    if (sucesso || fechando) {
      throw new Error("O avistamento já foi concluído.");
    }
    if (avistamentoCriadoRef.current) return;

    if (!animal?.id || !localidade.trim() || !dataHora) {
      throw new Error("Dados obrigatórios do avistamento ausentes.");
    }

    const dados = new FormData();
    dados.append("animal", String(animal.id));
    dados.append("localidade", localidade.trim());
    dados.append("data_hora", dataHora);
    dados.append("descricao", mensagem);
    dados.append("nome_contato", nomeContato);
    dados.append("telefone_contato", telefoneContato);

    if (foto) dados.append("foto", foto);
    if (localizacaoMapa) {
      dados.append("latitude", localizacaoMapa.latitude.toFixed(6));
      dados.append("longitude", localizacaoMapa.longitude.toFixed(6));
    }

    await criarAvistamento(dados);
    avistamentoCriadoRef.current = true;
    setAvistamentoRegistrado(true);
  }

  return (
    <div
      className={`modal-fundo${fechando ? " modal-avistamento-overlay--saindo" : ""}`}
      role="presentation"
      onMouseDown={sucesso ? undefined : aoFechar}
    >
      <section
        className={`modal-avistamento${sucesso ? " modal-avistamento--sucesso" : ""}${fechando ? " modal-avistamento--saindo" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-avistamento"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {sucesso ? (
          <div className="avistamento-sucesso" role="status" aria-live="polite">
            <span className="avistamento-sucesso__icone" aria-hidden="true">✓</span>
            <h2 id="titulo-avistamento">Avistamento enviado!</h2>
            <p>O local foi registrado e o tutor recebeu seu aviso.</p>
          </div>
        ) : (
          <>
        <button
          className="botao-fechar-modal"
          type="button"
          onClick={aoFechar}
          aria-label="Fechar"
        >
          ×
        </button>

        <header className="cabecalho-modal">
          <p className="tag">Ajude a encontrar {animal.nome}</p>
          <h2 id="titulo-avistamento">Reportar avistamento</h2>
          <p>
            Informe o local e o horário aproximado. Seus dados de contato
            são opcionais e serão acessíveis somente ao tutor.
          </p>
        </header>

        <div className="avistamento">
          <section className="avistamento__localizacao" aria-label="Localização do avistamento">
            <div className="campo-formulario">
              <label htmlFor="localidade">
                Onde você viu {animal.nome}? *
              </label>
              <input
                id="localidade"
                type="text"
                value={localidade}
                onChange={(event) => setLocalidade(event.target.value)}
                placeholder="Ex.: Praça do Feijão, Centro, Guanambi-BA"
                maxLength={255}
                required
                disabled={avistamentoRegistrado}
              />
            </div>

            <div className="campo-formulario">
              <label htmlFor="data_hora">Quando você viu? *</label>
              <input
                id="data_hora"
                type="datetime-local"
                value={dataHora}
                onChange={(event) => setDataHora(event.target.value)}
                required
                disabled={avistamentoRegistrado}
              />
            </div>

            <SeletorLocalizacao
              valor={localizacaoMapa}
              aoSelecionar={setLocalizacaoMapa}
              contexto="avistamento"
            />
            {coordenadas && (
              <p className="coordenadas-avistamento">
                Coordenadas selecionadas: {coordenadas}
              </p>
            )}
          </section>

          <section className="avistamento__detalhes">
            <div className="campo-formulario">
              <label htmlFor="foto">
                Foto do avistamento <span>(opcional)</span>
              </label>
              <input
                id="foto"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => setFoto(event.target.files?.[0] || null)}
                disabled={avistamentoRegistrado}
              />
              <small>
                Envie uma foto somente se ela foi tirada no momento do
                avistamento.
              </small>
            </div>

            <div className="campo-formulario">
              <label htmlFor="nome_contato">
                Seu nome <span>(opcional)</span>
              </label>
              <input
                id="nome_contato"
                type="text"
                value={nomeContato}
                onChange={(event) => setNomeContato(event.target.value)}
                placeholder="Como podemos chamar você?"
                disabled={avistamentoRegistrado}
              />
            </div>

            <div className="campo-formulario">
              <label htmlFor="telefone_contato">
                Telefone ou WhatsApp <span>(opcional)</span>
              </label>
              <input
                id="telefone_contato"
                type="tel"
                value={telefoneContato}
                onChange={(event) => setTelefoneContato(event.target.value)}
                placeholder="(77) 99999-9999"
                disabled={avistamentoRegistrado}
              />
            </div>
          </section>

          <section className="campo-mensagem-avistamento">
            <FormularioContatoTutor
              modoAvistamento
              animalId={animal.id}
              localizacaoTexto={localizacaoTexto}
              avistamentoRegistrado={avistamentoRegistrado}
              onBeforeSend={registrarAvistamentoAntesDoAviso}
              onSuccess={concluirComSucesso}
              aoCancelar={aoFechar}
            />
          </section>
        </div>
          </>
        )}
      </section>
    </div>
  );
}

export default ReportarAvistamento;
