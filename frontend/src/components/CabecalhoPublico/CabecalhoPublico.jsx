import { Link, NavLink } from "react-router-dom";

import "./CabecalhoPublico.css";

function CabecalhoPublico({ mostrarEntrar = true }) {
  function classeLink({ isActive }) {
    return `link-navegacao-publica${
      isActive ? " link-navegacao-publica-ativo" : ""
    }`;
  }

  return (
    <header className="cabecalho-publico">
      <Link className="logo-publica" to="/">
        <span className="icone-logo-publica" aria-hidden="true">
          🐾
        </span>

        <span>MyPetFound</span>
      </Link>

      <nav
        className="navegacao-publica"
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

        {mostrarEntrar && (
          <NavLink className="botao-entrar-publico" to="/entrar">
            Entrar
          </NavLink>
        )}
      </nav>
    </header>
  );
}

export default CabecalhoPublico;
