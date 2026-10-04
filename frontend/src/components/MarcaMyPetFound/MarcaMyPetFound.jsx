import { Link } from "react-router-dom";

import logoPata from "../../assets/logo-pata.svg";
import "./MarcaMyPetFound.css";

function MarcaMyPetFound({ to = "/", className = "" }) {
  return (
    <Link
      className={`marca-mypetfound ${className}`.trim()}
      to={to}
      aria-label="MyPetFound - início"
    >
      <span className="marca-mypetfound-icone" aria-hidden="true">
        <img src={logoPata} alt="" />
      </span>
      <span className="marca-mypetfound-nome">MyPetFound</span>
    </Link>
  );
}

export default MarcaMyPetFound;
