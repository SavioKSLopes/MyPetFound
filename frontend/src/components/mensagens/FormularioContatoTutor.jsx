import { useState } from "react";

import { enviarMensagemPublica } from "../../services/mensagensService.js";
import Botao from "../ui/Botao";
import CampoFormulario from "../ui/CampoFormulario";
import CampoTextarea from "../ui/CampoTextarea";
import Card from "../ui/Card";
import "./formularioContatoTutor.css";

function FormularioContatoTutor({
  animalId,
  modoAvistamento = false,
  localizacaoTexto: localizacaoTextoExterna = "",
  avistamentoRegistrado = false,
  onBeforeSend,
  onSuccess,
  aoCancelar,
}) {
  const [mensagem, setMensagem] = useState("");
  const [localizacaoTexto, setLocalizacaoTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erroGeral, setErroGeral] = useState("");
  const [erroMensagem, setErroMensagem] = useState("");
  const [erroLocalizacao, setErroLocalizacao] = useState("");

  async function enviar(event) {
    event.preventDefault();
    if (enviando || sucesso) return;

    const texto = mensagem.trim();
    const local = localizacaoTexto.trim();
    setErroGeral("");
    setErroMensagem("");
    setErroLocalizacao("");
    setSucesso(false);

    if (!texto) {
      setErroMensagem("Informe uma mensagem para o tutor.");
      return;
    }
    if (!animalId) {
      setErroGeral("Não foi possível identificar o animal para enviar o aviso.");
      return;
    }

    setEnviando(true);
    try {
      if (onBeforeSend) {
        try {
          await onBeforeSend({ mensagem: texto });
        } catch {
          setErroGeral("Não foi possível registrar o avistamento. Tente novamente.");
          return;
        }
      }

      try {
        await enviarMensagemPublica(animalId, {
          mensagem: texto,
          localizacao_texto: modoAvistamento ? localizacaoTextoExterna : local,
        });
      } catch (error) {
        if (modoAvistamento) {
          setErroGeral("O avistamento foi registrado, mas não foi possível avisar o tutor agora.");
          return;
        }
        throw error;
      }
      setMensagem("");
      setLocalizacaoTexto("");
      setSucesso(true);
      onSuccess?.();
    } catch (error) {
      const dados = error.response?.data;
      if (!modoAvistamento) {
        setErroMensagem(Array.isArray(dados?.mensagem) ? dados.mensagem[0] : "");
        setErroLocalizacao(Array.isArray(dados?.localizacao_texto) ? dados.localizacao_texto[0] : "");
        setErroGeral(
          dados?.detalhe ||
            (!dados?.mensagem && !dados?.localizacao_texto
              ? "Não foi possível enviar a mensagem. Verifique os dados e tente novamente."
              : ""),
        );
      } else {
        setErroGeral("O avistamento foi registrado, mas não foi possível avisar o tutor agora.");
      }
    } finally {
      setEnviando(false);
    }
  }

  const Container = modoAvistamento ? "section" : Card;
  const containerProps = modoAvistamento ? {} : { as: "section" };

  return (
    <Container
      {...containerProps}
      className="formulario-contato-tutor"
      aria-labelledby={modoAvistamento ? undefined : "titulo-contato-tutor"}
    >
      {!modoAvistamento && (
        <>
          <h2 id="titulo-contato-tutor">Viu este pet?</h2>
          <p>
            Avise o tutor onde e quando você viu o animal. Sua informação pode
            ajudar este pet a voltar para casa.
          </p>
        </>
      )}
      <form onSubmit={enviar} noValidate>
        <CampoTextarea
          id="mensagem-contato-animal"
          className={modoAvistamento ? "campo-formulario" : ""}
          label="O que você viu?"
          value={mensagem}
          onChange={(event) => setMensagem(event.target.value)}
          placeholder="Ex.: Vi este animal próximo à praça por volta das 16h. Ele parecia estar bem."
          maxLength={1000}
          rows={modoAvistamento ? 5 : undefined}
          required
          readOnly={avistamentoRegistrado}
          erro={erroMensagem}
        />
        {modoAvistamento && (
          <small className="ajuda-privacidade-avistamento">
            🔒 A descrição será enviada ao tutor sem exibir seus dados publicamente.
          </small>
        )}
        {!modoAvistamento && (
          <CampoFormulario
            id="localizacao-contato-animal"
            label="Local do avistamento (opcional)"
            erro={erroLocalizacao}
          >
            <input
              type="text"
              value={localizacaoTexto}
              onChange={(event) => setLocalizacaoTexto(event.target.value)}
              placeholder="Ex.: Praça do Mercado, Guanambi - BA"
              maxLength={255}
            />
          </CampoFormulario>
        )}
        <div className="feedback-contato" aria-live="polite">
          {erroGeral && <p className="erro-contato" role="alert">{erroGeral}</p>}
          {sucesso && <p className="sucesso-contato" role="status">{modoAvistamento ? "Avistamento registrado e tutor avisado." : "Mensagem enviada ao tutor. Obrigado por ajudar."}</p>}
        </div>
        <div className={`acoes-formulario-contato${modoAvistamento ? " acoes-modal" : ""}`}>
          {aoCancelar && (
            <Botao
              className={modoAvistamento ? "botao-cancelar-avistamento" : ""}
              type="button"
              variant="secundario"
              onClick={aoCancelar}
              disabled={enviando || sucesso}
            >
              Cancelar
            </Botao>
          )}
          <Botao
            className={modoAvistamento ? "botao-enviar-avistamento" : "botao-enviar-mensagem"}
            type="submit"
            loading={enviando}
            disabled={enviando || sucesso}
          >
            {enviando
              ? modoAvistamento ? "Enviando avistamento..." : "Enviando..."
              : modoAvistamento ? "Enviar avistamento" : "Enviar aviso ao tutor"}
          </Botao>
        </div>
      </form>
    </Container>
  );
}

export default FormularioContatoTutor;
