import { obterCategoriaStatusAnimal } from "../../utils/animal.js";
import "./animal.css";

function AnimalStatus({
  status,
  statusNome,
  desaparecido,
  className = "",
  children,
}) {
  const categoria = obterCategoriaStatusAnimal(status, desaparecido);
  const classeStatus = String(status || "CADASTRADO")
    .toLowerCase()
    .replaceAll("_", "-");
  const texto = statusNome || status || "Cadastrado";
  const categoriaCompat = categoria === "perdido"
    ? "perdido"
    : categoria === "positivo"
      ? "reencontrado"
      : "cadastrado";

  return (
    <span
      className={`animal-status animal-status-${categoria} ${className} status-${classeStatus} status-${categoriaCompat}`.trim()}
      aria-label={`Status: ${texto}`}
    >
      {children || texto}
    </span>
  );
}

export default AnimalStatus;
