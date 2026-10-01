import { useCallback, useEffect, useState } from "react";

import {
  listarMensagens,
  marcarMensagemComoLida,
} from "../services/mensagensService.js";

function useMensagens() {
  const [mensagens, setMensagens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [atualizandoId, setAtualizandoId] = useState(null);

  const carregarMensagens = useCallback(async (reiniciar = false) => {
    if (reiniciar) {
      setCarregando(true);
      setErro("");
    }

    try {
      const resposta = await listarMensagens();
      setMensagens(resposta.data);
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
      setErro("Não foi possível carregar suas mensagens. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    // A requisição atualiza estado depois da resposta do serviço.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregarMensagens();
  }, [carregarMensagens]);

  const marcarComoLida = useCallback(async (mensagemId) => {
    try {
      setAtualizandoId(mensagemId);
      await marcarMensagemComoLida(mensagemId);
      setMensagens((atuais) =>
        atuais.map((mensagem) =>
          mensagem.id === mensagemId ? { ...mensagem, lida: true } : mensagem,
        ),
      );
    } catch (error) {
      console.error("Erro ao marcar mensagem como lida:", error);
      setErro("Não foi possível atualizar a mensagem. Tente novamente.");
    } finally {
      setAtualizandoId(null);
    }
  }, []);

  return {
    mensagens,
    carregando,
    erro,
    atualizandoId,
    tentarCarregarMensagens: () => carregarMensagens(true),
    marcarComoLida,
  };
}

export default useMensagens;
