import { useCallback, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";

const CHAVE_TOKEN = "mypetfound_token";
const ouvintes = new Set();

function notificarMudancaToken() {
  ouvintes.forEach((ouvinte) => ouvinte());
}

function assinarMudancas(ouvinte) {
  if (ouvintes.size === 0) {
    window.addEventListener("storage", notificarMudancaToken);
  }

  ouvintes.add(ouvinte);

  return () => {
    ouvintes.delete(ouvinte);

    if (ouvintes.size === 0) {
      window.removeEventListener("storage", notificarMudancaToken);
    }
  };
}

function lerEstadoAutenticacao() {
  return Boolean(localStorage.getItem(CHAVE_TOKEN));
}

function useAuth() {
  const navegar = useNavigate();
  const temToken = useSyncExternalStore(
    assinarMudancas,
    lerEstadoAutenticacao,
    () => false,
  );

  const sair = useCallback((destino = "/") => {
    localStorage.removeItem(CHAVE_TOKEN);
    notificarMudancaToken();
    navegar(destino, { replace: true });
  }, [navegar]);

  const autenticar = useCallback((token, destino = "/meus-animais") => {
    if (typeof token !== "string" || token.length === 0) {
      return false;
    }

    localStorage.setItem(CHAVE_TOKEN, token);
    notificarMudancaToken();
    navegar(destino, { replace: true });
    return true;
  }, [navegar]);

  return {
    temToken,
    isAuthenticated: temToken,
    autenticar,
    sair,
  };
}

export default useAuth;
