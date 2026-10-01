import { cloneElement, isValidElement } from "react";
import "./ui.css";

function CampoFormulario({
  id,
  label,
  children,
  className = "",
  erro,
  ajuda,
  required = false,
}) {
  const idAjuda = ajuda ? `${id}-ajuda` : undefined;
  const idErro = erro ? `${id}-erro` : undefined;
  const descricoes = [children?.props?.["aria-describedby"], idAjuda, idErro]
    .filter(Boolean)
    .join(" ");
  const controle = isValidElement(children)
    ? cloneElement(children, {
        id: children.props.id || id,
        required: required || children.props.required,
        "aria-invalid": erro ? true : children.props["aria-invalid"],
        "aria-describedby": descricoes || undefined,
      })
    : children;

  return (
    <div className={`campo-formulario-ui ${className}`.trim()}>
      <label htmlFor={id}>{label}</label>
      {controle}
      {ajuda && <small id={idAjuda}>{ajuda}</small>}
      {erro && (
        <small className="campo-formulario-erro" id={idErro} role="alert">
          {erro}
        </small>
      )}
    </div>
  );
}

export default CampoFormulario;
