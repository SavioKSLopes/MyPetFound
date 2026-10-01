import CabecalhoPublico from "../CabecalhoPublico/CabecalhoPublico";
import "./layout.css";

function LayoutPublico({ children, className = "", mostrarEntrar = true }) {
  return (
    <main className={`layout-publico ${className}`.trim()}>
      <CabecalhoPublico mostrarEntrar={mostrarEntrar} />
      {children}
    </main>
  );
}

export default LayoutPublico;
