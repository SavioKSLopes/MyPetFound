import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

const CHAVE_TOKEN = "mypetfound_token";

function useAuth() {
  const navegar = useNavigate();

  const sair = useCallback((destino = "/") => {
    localStorage.removeItem(CHAVE_TOKEN);
    navegar(destino, { replace: true });
  }, [navegar]);

  const autenticar = useCallback((token, destino = "/meus-animais") => {
    if (typeof token !== "string" || token.length === 0) {
      return false;
    }

    localStorage.setItem(CHAVE_TOKEN, token);
    navegar(destino, { replace: true });
    return true;
  }, [navegar]);

  return {
    temToken: Boolean(localStorage.getItem(CHAVE_TOKEN)),
    autenticar,
    sair,
  };
}

export default useAuth;
