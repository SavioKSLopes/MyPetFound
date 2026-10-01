import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

const CHAVE_TOKEN = "mypetfound_token";

function useAuth() {
  const navegar = useNavigate();

  const sair = useCallback((destino = "/") => {
    localStorage.removeItem(CHAVE_TOKEN);
    navegar(destino, { replace: true });
  }, [navegar]);

  return {
    temToken: Boolean(localStorage.getItem(CHAVE_TOKEN)),
    sair,
  };
}

export default useAuth;
