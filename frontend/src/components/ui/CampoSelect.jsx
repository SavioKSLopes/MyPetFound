import CampoFormulario from "./CampoFormulario";

function CampoSelect({
  id,
  label,
  className = "",
  children,
  erro,
  ajuda,
  required = false,
  ...props
}) {
  return (
    <CampoFormulario id={id} label={label} className={className} erro={erro} ajuda={ajuda} required={required}>
      <select id={id} {...props}>
        {children}
      </select>
    </CampoFormulario>
  );
}

export default CampoSelect;
