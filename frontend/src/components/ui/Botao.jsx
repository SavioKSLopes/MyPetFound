import "./ui.css";

function Botao({
  children,
  variant = "primario",
  className = "",
  loading = false,
  disabled = false,
  type = "button",
  onClick,
  ...props
}) {
  return (
    <button
      {...props}
      className={`botao-ui botao-ui-${variant} ${className}`.trim()}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {children}
    </button>
  );
}

export default Botao;
