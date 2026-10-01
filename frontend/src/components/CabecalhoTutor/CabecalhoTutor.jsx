import { Link, NavLink } from "react-router-dom";

import useAuth from "../../hooks/useAuth.js";
import "./CabecalhoTutor.css";

function CabecalhoTutor() {
  const { sair } = useAuth();

  function classeLinkNavegacao({ isActive }) {
    return `link-navegacao-tutor${
      isActive ? " link-navegacao-tutor-ativo" : ""
    }`;
  }

  return (
    <header className="cabecalho-tutor">
      <Link className="logo-tutor" to="/">
        <span className="icone-logo-tutor" aria-hidden="true">
          🐾
        </span>

        <span>MyPetFound</span>
      </Link>

      <nav
        className="navegacao-tutor"
        aria-label="Navegação da área do tutor"
      >
        <NavLink
          className={classeLinkNavegacao}
          to="/meus-animais"
        >
          Meus animais
        </NavLink>

        <NavLink
          className={classeLinkNavegacao}
          to="/mensagens"
        >
          Mensagens
        </NavLink>

        <NavLink
          className={classeLinkNavegacao}
          to="/"
          end
        >
          Animais perdidos
        </NavLink>

        <button
          className="botao-sair-tutor"
          type="button"
          onClick={sair}
        >
          Sair
        </button>
      </nav>
    </header>
  );
}

export default CabecalhoTutor;
