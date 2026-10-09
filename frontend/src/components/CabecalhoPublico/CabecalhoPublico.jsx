import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import useAuth from "../../hooks/useAuth.js";
import MarcaMyPetFound from "../MarcaMyPetFound/MarcaMyPetFound";
import "./CabecalhoPublico.css";

function CabecalhoPublico({ mostrarEntrar = true }) {
  const { isAuthenticated, sair } = useAuth();
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    if (!menuAberto) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") setMenuAberto(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuAberto]);

  function handleLogout() {
    setMenuAberto(false);
    sair();
  }

  function classeLink({ isActive }) {
    return `link-navegacao-base${
      isActive ? " link-navegacao-base-ativo" : ""
    }`;
  }

  return (
    <header className="cabecalho-base cabecalho-publico">
      <MarcaMyPetFound />

      <button
        type="button"
        className="botao-menu-mobile"
        aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
        aria-expanded={menuAberto}
        aria-controls="menu-navegacao-publico"
        onClick={() => setMenuAberto((aberto) => !aberto)}
      >
        {menuAberto ? (
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        )}
      </button>

      <nav
        id="menu-navegacao-publico"
        className={`navegacao-base navegacao-publica${
          menuAberto ? " menu-publico--aberto" : ""
        }`}
        aria-label="Navegação principal"
      >
        <NavLink className={classeLink} to="/" end onClick={() => setMenuAberto(false)}>
          Início
        </NavLink>

        <NavLink className={classeLink} to="/buscar" onClick={() => setMenuAberto(false)}>
          Buscar animais
        </NavLink>

        <NavLink className={classeLink} to="/mapa" onClick={() => setMenuAberto(false)}>
          Mapa
        </NavLink>

        {isAuthenticated ? (
          <>
            <NavLink className={classeLink} to="/meus-animais" onClick={() => setMenuAberto(false)}>
              Meus animais
            </NavLink>
            <button
              className="botao-cabecalho botao-sair-base"
              type="button"
              onClick={handleLogout}
            >
              Sair
            </button>
          </>
        ) : (
          mostrarEntrar && (
            <NavLink className="botao-cabecalho botao-entrar-publico" to="/entrar" onClick={() => setMenuAberto(false)}>
              Entrar
            </NavLink>
          )
        )}
      </nav>
    </header>
  );
}

export default CabecalhoPublico;
