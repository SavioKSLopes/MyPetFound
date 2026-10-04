import { NavLink } from "react-router-dom";

import useAuth from "../../hooks/useAuth.js";
import MarcaMyPetFound from "../MarcaMyPetFound/MarcaMyPetFound";
import "./CabecalhoPublico.css";

function CabecalhoPublico({ mostrarEntrar = true }) {
  const { isAuthenticated, sair } = useAuth();

  function classeLink({ isActive }) {
    return `link-navegacao-base${
      isActive ? " link-navegacao-base-ativo" : ""
    }`;
  }

  return (
    <header className="cabecalho-base cabecalho-publico">
      <MarcaMyPetFound />

      <nav
        className="navegacao-base navegacao-publica"
        aria-label="Navegação principal"
      >
        <NavLink className={classeLink} to="/" end>
          Início
        </NavLink>

        <NavLink className={classeLink} to="/buscar">
          Buscar animais
        </NavLink>

        <NavLink className={classeLink} to="/mapa">
          Mapa
        </NavLink>

        {isAuthenticated ? (
          <>
            <NavLink className={classeLink} to="/meus-animais">
              Meus animais
            </NavLink>
            <button
              className="botao-cabecalho botao-sair-base"
              type="button"
              onClick={() => sair()}
            >
              Sair
            </button>
          </>
        ) : (
          mostrarEntrar && (
            <NavLink className="botao-cabecalho botao-entrar-publico" to="/entrar">
              Entrar
            </NavLink>
          )
        )}
      </nav>
    </header>
  );
}

export default CabecalhoPublico;
