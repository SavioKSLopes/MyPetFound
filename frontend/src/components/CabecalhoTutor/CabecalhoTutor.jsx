import { Link, NavLink, useNavigate } from "react-router-dom";

import "./CabecalhoTutor.css";

function CabecalhoTutor() {
  const navegar = useNavigate();

  function sair() {
    localStorage.removeItem("mypetfound_token");

    navegar("/", {
      replace: true,
    });
  }

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