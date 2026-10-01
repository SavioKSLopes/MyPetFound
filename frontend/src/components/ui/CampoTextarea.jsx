import CampoFormulario from "./CampoFormulario";

function CampoTextarea({ id, label, className = "", erro, ajuda, required = false, ...props }) {
  return (
    <CampoFormulario id={id} label={label} className={className} erro={erro} ajuda={ajuda} required={required}>
      <textarea id={id} required={required} {...props} />
    </CampoFormulario>
  );
}

export default CampoTextarea;
