import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import useAuth from "../../hooks/useAuth.js";
import MarcaMyPetFound from "../MarcaMyPetFound/MarcaMyPetFound";
import "./CabecalhoTutor.css";

function CabecalhoTutor() {
  const { sair } = useAuth();
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    if (!menuAberto) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setMenuAberto(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuAberto]);

  function handleLogout() {
    setMenuAberto(false);
    sair();
  }

  function classeLinkNavegacao({ isActive }) {
    return `link-navegacao-base${
      isActive ? " link-navegacao-base-ativo" : ""
    }`;
  }

  return (
    <header className="cabecalho-base cabecalho-tutor">
      <MarcaMyPetFound />

      <button
        type="button"
        className="botao-menu-mobile"
        aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
        aria-expanded={menuAberto}
        aria-controls="menu-navegacao-tutor"
        onClick={() => setMenuAberto((aberto) => !aberto)}
      >
        {menuAberto ? (
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        )}
      </button>

      <nav
        id="menu-navegacao-tutor"
        className={`navegacao-base navegacao-tutor${
          menuAberto ? " menu-tutor--aberto" : ""
        }`}
        aria-label="Navegação da área do tutor"
      >
        <NavLink
          className={classeLinkNavegacao}
          to="/meus-animais"
          onClick={() => setMenuAberto(false)}
        >
          Meus animais
        </NavLink>

        <NavLink
          className={classeLinkNavegacao}
          to="/mensagens"
          onClick={() => setMenuAberto(false)}
        >
          Mensagens
        </NavLink>

        <NavLink
          className={classeLinkNavegacao}
          to="/"
          end
          onClick={() => setMenuAberto(false)}
        >
          Animais perdidos
        </NavLink>

        <button
          className="botao-cabecalho botao-sair-base"
          type="button"
          onClick={handleLogout}
        >
          Sair
        </button>
      </nav>
    </header>
  );
}

export default CabecalhoTutor;
