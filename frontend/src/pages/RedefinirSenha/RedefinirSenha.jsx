import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import Botao from "../../components/ui/Botao.jsx";
import Card from "../../components/ui/Card.jsx";
import LayoutPublico from "../../components/layout/LayoutPublico.jsx";
import { redefinirSenha } from "../../services/usuariosService.js";
import "../RecuperacaoSenha.css";

const MENSAGEM_LINK_INVALIDO = "O link de redefinição é inválido ou expirou. Solicite um novo link.";

function RedefinirSenha() {
  const { uid, token } = useParams();
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");
  const [mostrarNova, setMostrarNova] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [concluido, setConcluido] = useState(false);
  const [linkInvalido, setLinkInvalido] = useState(false);
  const [erro, setErro] = useState("");

  async function enviar(event) {
    event.preventDefault();
    if (enviando) return;

    setErro("");
    if (!novaSenha || !confirmacaoSenha) {
      setErro("Preencha os dois campos de senha.");
      return;
    }
    if (novaSenha !== confirmacaoSenha) {
      setErro("As senhas informadas não conferem.");
      return;
    }

    setEnviando(true);
    try {
      await redefinirSenha({
        uid,
        token,
        nova_senha: novaSenha,
        confirmacao_senha: confirmacaoSenha,
      });
      setNovaSenha("");
      setConfirmacaoSenha("");
      setConcluido(true);
    } catch (error) {
      const dados = error.response?.data;
      if (dados?.detail === MENSAGEM_LINK_INVALIDO) {
        setLinkInvalido(true);
      } else if (dados?.nova_senha) {
        setErro(Array.isArray(dados.nova_senha) ? dados.nova_senha.join(" ") : String(dados.nova_senha));
      } else if (dados?.confirmacao_senha) {
        setErro(Array.isArray(dados.confirmacao_senha) ? dados.confirmacao_senha.join(" ") : String(dados.confirmacao_senha));
      } else {
        setErro("Não foi possível redefinir a senha agora. Tente novamente em instantes.");
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <LayoutPublico className="pagina-recuperacao-senha">
      <Card as="section" className="painel-recuperacao-senha" aria-labelledby="titulo-redefinir-senha">
        {concluido ? (
          <div role="status" aria-live="polite">
            <h1 id="titulo-redefinir-senha">Senha redefinida com sucesso</h1>
            <p>Você já pode entrar usando sua nova senha.</p>
            <Link
              className="botao-ui botao-ui-primario acao-recuperacao"
              to="/entrar"
              state={{ mensagemSucesso: "Senha redefinida com sucesso. Entre com sua nova senha." }}
            >
              Ir para entrar
            </Link>
          </div>
        ) : linkInvalido ? (
          <div role="alert">
            <h1 id="titulo-redefinir-senha">Este link é inválido ou expirou.</h1>
            <Link className="botao-ui botao-ui-primario acao-recuperacao" to="/esqueci-senha">
              Solicitar novo link
            </Link>
          </div>
        ) : (
          <>
            <header className="cabecalho-recuperacao-senha">
              <h1 id="titulo-redefinir-senha">Definir nova senha</h1>
              <p>Digite e confirme sua nova senha.</p>
            </header>

            <form className="formulario-recuperacao-senha" onSubmit={enviar}>
              <div className="campo-senha-recuperacao">
                <label htmlFor="nova-senha">Nova senha</label>
                <div className="entrada-senha-recuperacao">
                  <input
                    id="nova-senha"
                    name="nova_senha"
                    type={mostrarNova ? "text" : "password"}
                    autoComplete="new-password"
                    value={novaSenha}
                    onChange={(event) => setNovaSenha(event.target.value)}
                    aria-describedby="requisitos-senha"
                    required
                  />
                  <button
                    type="button"
                    className="botao-visibilidade-senha"
                    onClick={() => setMostrarNova((valor) => !valor)}
                    aria-label={mostrarNova ? "Ocultar nova senha" : "Mostrar nova senha"}
                    aria-pressed={mostrarNova}
                    title={mostrarNova ? "Ocultar senha" : "Mostrar senha"}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                      <circle cx="12" cy="12" r="2.5" />
                      {mostrarNova && <path d="m4 4 16 16" />}
                    </svg>
                  </button>
                </div>
                <small id="requisitos-senha">
                  Use pelo menos 8 caracteres; evite senhas comuns, somente números
                  ou semelhantes aos seus dados de usuário.
                </small>
              </div>

              <div className="campo-senha-recuperacao">
                <label htmlFor="confirmacao-senha">Confirmar nova senha</label>
                <div className="entrada-senha-recuperacao">
                  <input
                    id="confirmacao-senha"
                    name="confirmacao_senha"
                    type={mostrarConfirmacao ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmacaoSenha}
                    onChange={(event) => setConfirmacaoSenha(event.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="botao-visibilidade-senha"
                    onClick={() => setMostrarConfirmacao((valor) => !valor)}
                    aria-label={mostrarConfirmacao ? "Ocultar confirmação da senha" : "Mostrar confirmação da senha"}
                    aria-pressed={mostrarConfirmacao}
                    title={mostrarConfirmacao ? "Ocultar senha" : "Mostrar senha"}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                      <circle cx="12" cy="12" r="2.5" />
                      {mostrarConfirmacao && <path d="m4 4 16 16" />}
                    </svg>
                  </button>
                </div>
              </div>

              {erro && <p className="erro-recuperacao-senha" role="alert">{erro}</p>}

              <Botao type="submit" className="acao-recuperacao" loading={enviando}>
                {enviando ? "Redefinindo..." : "Redefinir senha"}
              </Botao>
            </form>
          </>
        )}
      </Card>
    </LayoutPublico>
  );
}

export default RedefinirSenha;
