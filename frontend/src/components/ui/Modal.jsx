import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import Botao from "./Botao.jsx";
import "./modal.css";

function Modal({ titulo, aoFechar, children, className = "" }) {
  const dialogoRef = useRef(null);
  const tituloRef = useRef(null);
  const tituloId = useId();

  useEffect(() => {
    const focoAnterior = document.activeElement;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    tituloRef.current?.focus();

    function tratarTeclado(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        aoFechar();
        return;
      }

      if (event.key !== "Tab") return;
      const focaveis = dialogoRef.current?.querySelectorAll(
        'a[href], button:not(:disabled), input:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
      );
      if (!focaveis?.length) {
        event.preventDefault();
        tituloRef.current?.focus();
        return;
      }

      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];
      if (event.shiftKey && (document.activeElement === primeiro || document.activeElement === tituloRef.current)) {
        event.preventDefault();
        ultimo.focus();
      } else if (!event.shiftKey && document.activeElement === ultimo) {
        event.preventDefault();
        primeiro.focus();
      }
    }

    document.addEventListener("keydown", tratarTeclado);
    return () => {
      document.removeEventListener("keydown", tratarTeclado);
      document.body.style.overflow = overflowAnterior;
      focoAnterior?.focus?.({ preventScroll: true });
    };
  }, [aoFechar]);

  return createPortal(
    <div
      className="modal-fundo"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) aoFechar();
      }}
    >
      <section
        ref={dialogoRef}
        className={`modal-dialogo ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
      >
        <header className="modal-cabecalho">
          <h2 id={tituloId} ref={tituloRef} tabIndex={-1}>{titulo}</h2>
          <Botao variant="secundario" className="modal-fechar" onClick={aoFechar} aria-label="Fechar janela">
            <span aria-hidden="true">×</span>
          </Botao>
        </header>
        {children}
      </section>
    </div>,
    document.body,
  );
}

export default Modal;
