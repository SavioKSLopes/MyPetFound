import CabecalhoTutor from "../CabecalhoTutor/CabecalhoTutor";
import "./layout.css";

function LayoutTutor({ children, className = "" }) {
  return (
    <main className={`layout-tutor ${className}`.trim()} id="conteudo-principal">
      <CabecalhoTutor />
      {children}
    </main>
  );
}

export default LayoutTutor;
