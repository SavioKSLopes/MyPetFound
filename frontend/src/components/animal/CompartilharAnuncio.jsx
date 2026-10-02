import { useState } from "react";
import Botao from "../ui/Botao.jsx";
import { montarTextoCompartilhamento, obterUrlPublicaAnuncio } from "../../utils/compartilhamento.js";
import "./compartilhar.css";

function CompartilharAnuncio({ animal }) {
  const [feedback, setFeedback] = useState("");
  const url = obterUrlPublicaAnuncio(animal.id);
  const texto = montarTextoCompartilhamento(animal, url);

  async function compartilhar() {
    setFeedback("");
    if (!navigator.share) {
      setFeedback("Compartilhamento nativo indisponível. Use o botão WhatsApp.");
      return;
    }
    try {
      await navigator.share({ title: `Ajude a encontrar ${animal.nome}`, text: texto, url });
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error("Falha ao compartilhar anúncio:", error);
        setFeedback("Não foi possível abrir o compartilhamento. Use o botão WhatsApp.");
      }
    }
  }

  function compartilharWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="compartilhar-anuncio">
      <Botao onClick={compartilhar}>Compartilhar</Botao>
      <Botao variant="secundario" onClick={compartilharWhatsApp}>WhatsApp</Botao>
      <span role="status" aria-live="polite">{feedback}</span>
    </div>
  );
}

export default CompartilharAnuncio;
