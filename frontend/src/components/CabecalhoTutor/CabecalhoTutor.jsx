import { NavLink } from "react-router-dom";

import useAuth from "../../hooks/useAuth.js";
import MarcaMyPetFound from "../MarcaMyPetFound/MarcaMyPetFound";
import "./CabecalhoTutor.css";

function CabecalhoTutor() {
  const { sair } = useAuth();

  function classeLinkNavegacao({ isActive }) {
    return `link-navegacao-base${
      isActive ? " link-navegacao-base-ativo" : ""
    }`;
  }

  return (
    <header className="cabecalho-base cabecalho-tutor">
      <MarcaMyPetFound />

      <nav
        className="navegacao-base navegacao-tutor"
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
          className="botao-cabecalho botao-sair-base"
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
