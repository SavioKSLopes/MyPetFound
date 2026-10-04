import { useCallback, useEffect, useRef, useState } from "react";
import Botao from "../ui/Botao.jsx";
import Modal from "../ui/Modal.jsx";
import {
  copiarTexto,
  montarTextoCompartilhamento,
  montarUrlFacebook,
  montarUrlPublicaAnuncio,
  montarUrlWhatsApp,
  montarUrlX,
} from "../../utils/compartilhamento.js";
import "./compartilhar.css";

function CompartilharAnuncio({ animal }) {
  const [feedback, setFeedback] = useState("");
  const [painelAberto, setPainelAberto] = useState(false);
  const [conteudoManual, setConteudoManual] = useState("");
  const campoManualRef = useRef(null);
  const temporizadorFeedback = useRef(null);
  const url = montarUrlPublicaAnuncio(animal);
  const texto = montarTextoCompartilhamento(animal, url);
  const titulo = `Ajude a encontrar ${animal.nome}`;

  const mostrarFeedback = useCallback((mensagem) => {
    window.clearTimeout(temporizadorFeedback.current);
    setFeedback(mensagem);
    temporizadorFeedback.current = window.setTimeout(() => setFeedback(""), 5000);
  }, []);

  const fecharPainel = useCallback(() => setPainelAberto(false), []);

  useEffect(() => () => window.clearTimeout(temporizadorFeedback.current), []);

  useEffect(() => {
    if (conteudoManual) {
      campoManualRef.current?.focus();
      campoManualRef.current?.select();
    }
  }, [conteudoManual]);

  async function compartilhar() {
    setFeedback("");
    if (typeof navigator.share !== "function") {
      setPainelAberto(true);
      return;
    }

    try {
      await navigator.share({ title: titulo, text: texto, url });
      mostrarFeedback("Compartilhamento concluído.");
    } catch (error) {
      if (error?.name === "AbortError") return;
      console.error("Falha ao compartilhar anúncio:", error);
      mostrarFeedback("O compartilhamento nativo falhou. Escolha outra opção.");
      setPainelAberto(true);
    }
  }

  function abrirEmNovaAba(destino) {
    try {
      const janela = window.open("about:blank", "_blank");
      if (!janela) return false;
      janela.opener = null;
      janela.location.replace(destino);
      return true;
    } catch (error) {
      console.error("Não foi possível abrir a opção de compartilhamento:", error);
      return false;
    }
  }

  function abrirRede(destino, nome) {
    if (abrirEmNovaAba(destino)) {
      mostrarFeedback(`${nome} aberto em outra aba. Conclua o compartilhamento por lá.`);
      return;
    }

    mostrarFeedback("Não foi possível abrir a nova janela. Copie o link e compartilhe manualmente.");
    setPainelAberto(true);
  }

  function compartilharNoFacebook() {
    let urlFacebook;
    try {
      urlFacebook = montarUrlFacebook(url);
    } catch {
      mostrarFeedback("Não foi possível montar a URL pública deste anúncio.");
      return;
    }

    const janela = window.open(urlFacebook, "_blank", "width=700,height=650");
    if (!janela) {
      mostrarFeedback("O navegador bloqueou a nova janela. Copie o link e compartilhe manualmente.");
      setConteudoManual(url);
      return;
    }

    try {
      janela.opener = null;
    } catch {
      // A URL aberta é pública e a página original não é redirecionada.
    }
    mostrarFeedback("Facebook aberto em outra janela. Revise e confirme o compartilhamento por lá.");
  }

  async function copiar(valor, sucesso) {
    const copiado = await copiarTexto(valor);
    if (copiado) {
      setConteudoManual("");
      mostrarFeedback(sucesso);
      return;
    }

    setConteudoManual(valor);
    mostrarFeedback("Não foi possível copiar automaticamente. O conteúdo está selecionado para cópia manual.");
  }

  const status = feedback && <span className="compartilhar-feedback" role="status" aria-live="polite">{feedback}</span>;

  return (
    <div className="compartilhar-anuncio">
      <div className="compartilhar-acoes-principais">
        <Botao onClick={compartilhar}>Compartilhar</Botao>
        <Botao
          variant="secundario"
          onClick={() => abrirRede(montarUrlWhatsApp(texto), "WhatsApp")}
        >
          WhatsApp
        </Botao>
      </div>
      {!painelAberto && status}

      {painelAberto && (
        <Modal titulo="Compartilhar anúncio" aoFechar={fecharPainel} className="modal-compartilhar">
          <p className="compartilhar-introducao">Ajude a encontrar {animal.nome}.</p>
          <div className="compartilhar-opcoes">
            <Botao onClick={() => abrirRede(montarUrlWhatsApp(texto), "WhatsApp")}>WhatsApp</Botao>
            <Botao variant="secundario" onClick={() => copiar(url, "Link copiado para a área de transferência.")}>Copiar link</Botao>
            <Botao variant="secundario" onClick={() => copiar(texto, "Texto do anúncio copiado.")}>Copiar texto</Botao>
            <Botao variant="secundario" onClick={compartilharNoFacebook}>Facebook</Botao>
            <Botao variant="secundario" onClick={() => abrirRede(montarUrlX(texto, url), "X")}>X</Botao>
          </div>
          {conteudoManual && (
            <label className="compartilhar-copia-manual">
              Conteúdo selecionado para copiar manualmente
              <textarea ref={campoManualRef} readOnly value={conteudoManual} />
            </label>
          )}
          <p className="compartilhar-aviso-privacidade">O texto contém apenas informações públicas do anúncio.</p>
          {status}
          <div className="compartilhar-fechar">
            <Botao variant="secundario" onClick={fecharPainel}>Fechar</Botao>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default CompartilharAnuncio;
