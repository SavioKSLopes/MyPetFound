import { useState } from "react";
import { Link } from "react-router-dom";

import Botao from "../../components/ui/Botao.jsx";
import CampoFormulario from "../../components/ui/CampoFormulario.jsx";
import Card from "../../components/ui/Card.jsx";
import LayoutPublico from "../../components/layout/LayoutPublico.jsx";
import { solicitarRedefinicaoSenha } from "../../services/usuariosService.js";
import "../RecuperacaoSenha.css";

function EsqueciSenha() {
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");

  async function enviar(event) {
    event.preventDefault();
    if (enviando) return;

    setErro("");
    setEnviando(true);
    try {
      await solicitarRedefinicaoSenha(email.trim());
      setEnviado(true);
    } catch {
      setErro("Não foi possível enviar as instruções agora. Tente novamente em instantes.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <LayoutPublico className="pagina-recuperacao-senha">
      <Card as="section" className="painel-recuperacao-senha" aria-labelledby="titulo-recuperacao">
        {enviado ? (
          <div role="status" aria-live="polite">
            <h1 id="titulo-recuperacao">Confira seu e-mail</h1>
            <p>
              Se houver uma conta ativa associada ao endereço informado,
              enviaremos instruções para redefinir sua senha.
            </p>
            <Link className="botao-ui botao-ui-primario acao-recuperacao" to="/entrar">
              Voltar para entrar
            </Link>
          </div>
        ) : (
          <>
            <header className="cabecalho-recuperacao-senha">
              <h1 id="titulo-recuperacao">Esqueceu sua senha?</h1>
              <p>
                Informe o e-mail usado no cadastro. Se houver uma conta ativa
                associada a ele, enviaremos instruções para redefinir sua senha.
              </p>
            </header>

            <form className="formulario-recuperacao-senha" onSubmit={enviar}>
              <CampoFormulario id="email-recuperacao" label="E-mail" required>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  maxLength={254}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </CampoFormulario>

              {erro && <p className="erro-recuperacao-senha" role="alert">{erro}</p>}

              <Botao type="submit" className="acao-recuperacao" loading={enviando}>
                {enviando ? "Enviando..." : "Enviar instruções"}
              </Botao>
            </form>

            <Link className="link-voltar-recuperacao" to="/entrar">
              ← Voltar para entrar
            </Link>
          </>
        )}
      </Card>
    </LayoutPublico>
  );
}

export default EsqueciSenha;
