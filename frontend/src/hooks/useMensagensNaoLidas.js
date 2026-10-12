import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import { contarMensagensNaoLidas } from "../services/mensagensService.js";
import useAuth from "./useAuth.js";

function useMensagensNaoLidas() {
  const { temToken } = useAuth();
  const { pathname } = useLocation();
  const [contagem, setContagem] = useState(0);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const carregarContagem = useCallback(async () => {
    if (!temToken) {
      setContagem(0);
      setErro("");
      setCarregando(false);
      return;
    }

    setCarregando(true);
    try {
      const resposta = await contarMensagensNaoLidas();
      setContagem(Number(resposta.data.nao_lidas) || 0);
      setErro("");
    } catch (error) {
      console.error("Erro ao contar mensagens não lidas:", error);
      setErro("Não foi possível obter a contagem de mensagens.");
      setContagem(-1);
    } finally {
      setCarregando(false);
    }
  }, [temToken]);

  // Carregamento inicial apenas quando autenticado
  useEffect(() => {
    // A requisição atualiza estado após a resposta do serviço.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (temToken) carregarContagem();
  }, [temToken, pathname, carregarContagem]);

  // Escuta evento de atualização de contagem (quando mensagem é marcada como lida)
  useEffect(() => {
    function handleAtualizarContagem() {
      carregarContagem();
    }
    function handleRetorno() { carregarContagem(); }
    window.addEventListener("mensagens:atualizar-contagem", handleAtualizarContagem);
    window.addEventListener("focus", handleRetorno);
    return () => {
      window.removeEventListener("mensagens:atualizar-contagem", handleAtualizarContagem);
      window.removeEventListener("focus", handleRetorno);
    };
  }, [carregarContagem]);

  return {
    contagem: temToken ? contagem : 0,
    carregando: temToken && carregando,
    erro: temToken ? erro : "",
    recarregar: carregarContagem,
  };
}

export default useMensagensNaoLidas;
