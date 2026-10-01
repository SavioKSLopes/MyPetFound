import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";


import LayoutPublico from "../../components/layout/LayoutPublico";
import AnimalImagem from "../../components/animal/AnimalImagem";
import EstadoTela from "../../components/ui/EstadoTela";
import { obterIdentificacaoAnimal } from "../../services/animaisService.js";
import { enviarMensagemPublica } from "../../services/mensagensService.js";
import "./IdentificacaoAnimal.css";

function IdentificacaoAnimal() {
  const { codigo } = useParams();

  const [animal, setAnimal] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [mensagem, setMensagem] = useState("");
  const [localizacaoTexto, setLocalizacaoTexto] = useState("");
  const [enviandoMensagem, setEnviandoMensagem] = useState(false);
  const [mensagemEnviada, setMensagemEnviada] = useState(false);
  const [erroMensagem, setErroMensagem] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarAnimal() {
      try {
        setCarregando(true);
        setErro("");

        const resposta = await obterIdentificacaoAnimal(codigo);

        if (ativo) {
          setAnimal(resposta.data);
        }
      } catch (error) {
        console.error("Erro ao abrir identificação:", error);

        if (ativo) {
          setErro(
            error.response?.status === 404
              ? "Esta identificação não foi encontrada."
              : "Não foi possível carregar a identificação agora.",
          );
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregarAnimal();

    return () => {
      ativo = false;
    };
  }, [codigo]);

  async function enviarMensagemAoTutor(event) {
    event.preventDefault();

    const textoMensagem = mensagem.trim();
    const textoLocalizacao = localizacaoTexto.trim();

    if (!textoMensagem) {
      setErroMensagem("Escreva uma mensagem para o tutor.");
      return;
    }

    if (!animal?.id) {
      setErroMensagem(
        "Não foi possível identificar o animal para enviar o aviso.",
      );
      return;
    }

    try {
      setEnviandoMensagem(true);
      setErroMensagem("");
      setMensagemEnviada(false);

      await enviarMensagemPublica(animal.id, {
        mensagem: textoMensagem,
        localizacao_texto: textoLocalizacao,
      });

      setMensagem("");
      setLocalizacaoTexto("");
      setMensagemEnviada(true);
    } catch (error) {
      console.error("Erro ao enviar aviso:", error);

      const dadosErro = error.response?.data;

      setErroMensagem(
        dadosErro?.mensagem?.[0] ||
          dadosErro?.detalhe ||
          "Não foi possível enviar o aviso. Tente novamente.",
      );
    } finally {
      setEnviandoMensagem(false);
    }
  }

  return (
    <LayoutPublico className="pagina-identificacao-animal">

      <section className="card-identificacao-animal">
        {carregando && (
          <EstadoTela tipo="carregando" mensagem="Carregando identificação..." />
        )}

        {!carregando && erro && (
          <EstadoTela tipo="naoEncontrado" titulo="Identificação indisponível" mensagem={erro} />
        )}

        {!carregando && !erro && animal && (
          <>
            <AnimalImagem src={animal.foto} nome={animal.nome} className="foto-identificacao-animal" />

            <div className="dados-identificacao-animal">
              <p className="etiqueta-identificacao-animal">
                Identificação do pet
              </p>

              <h1>{animal.nome}</h1>

              <p>
                {animal.especie} · {animal.porte}
              </p>

              <dl>
                <div>
                  <dt>Raça</dt>
                  <dd>{animal.raca || "Não informada"}</dd>
                </div>

                <div>
                  <dt>Cor</dt>
                  <dd>{animal.cor || "Não informada"}</dd>
                </div>
              </dl>

              <section className="contato-tutor">
                <h2>Você encontrou este animal?</h2>

                <p>
                  Envie um aviso ao tutor informando onde o animal foi visto
                  ou encontrado.
                </p>

                <form onSubmit={enviarMensagemAoTutor}>
                  <label htmlFor="mensagem">
                    Mensagem
                  </label>

                  <textarea
                    id="mensagem"
                    value={mensagem}
                    onChange={(event) => setMensagem(event.target.value)}
                    placeholder="Ex.: Vi este animal perto da praça e ele parecia estar bem."
                    maxLength={1000}
                    required
                  />

                  <label htmlFor="localizacao">
                    Local onde o animal foi visto
                  </label>

                  <input
                    id="localizacao"
                    type="text"
                    value={localizacaoTexto}
                    onChange={(event) => {
                      setLocalizacaoTexto(event.target.value);
                    }}
                    placeholder="Ex.: Praça do Mercado, Guanambi - BA"
                    maxLength={255}
                  />

                  {erroMensagem && (
                    <p className="mensagem-erro" role="alert">
                      {erroMensagem}
                    </p>
                  )}

                  {mensagemEnviada && (
                    <p className="mensagem-sucesso" role="status">
                      Aviso enviado ao tutor com sucesso. Obrigado por ajudar!
                    </p>
                  )}

                  <button type="submit" disabled={enviandoMensagem}>
                    {enviandoMensagem
                      ? "Enviando..."
                      : "Enviar aviso ao tutor"}
                  </button>
                </form>
              </section>
            </div>
          </>
        )}
      </section>
    </LayoutPublico>
  );
}

export default IdentificacaoAnimal;
