import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import LayoutPublico from "../../components/layout/LayoutPublico";
import useAuth from "../../hooks/useAuth.js";
import { api } from "../../services/api.js";
import "./Login.css";


function Login() {
  const localizacao = useLocation();
  const { autenticar } = useAuth();

  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  const destino = localizacao.state?.de || "/meus-animais";
  const mensagemSucesso = localizacao.state?.mensagemSucesso;

  async function fazerLogin(event) {
    event.preventDefault();

    setErro("");
    setEnviando(true);

    try {
      const response = await api.post("/auth/login/", {
        username: usuario,
        password: senha,
      });

      autenticar(response.data.token, destino);
    } catch (error) {
      if (error.response?.status === 400) {
        setErro(
          "Usuário ou senha inválidos. Verifique os dados e tente novamente.",
        );
      } else {
        setErro(
          "Não foi possível entrar no momento. Verifique se o backend está em execução.",
        );
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <LayoutPublico className="pagina-login" mostrarEntrar={false}>
      <section className="painel-login">
        <div className="cabecalho-login">
          <p className="tag-login">
            Área do tutor
          </p>

          <h1>Entre na sua conta</h1>

          <p>
            Acompanhe seus animais, ocorrências e avistamentos recebidos.
          </p>
        </div>

        <form className="formulario-login" onSubmit={fazerLogin}>
          {mensagemSucesso && (
            <p className="sucesso-login" role="status">
              {mensagemSucesso}
            </p>
          )}

          <div className="campo-login">
            <label htmlFor="usuario">
              Usuário
            </label>

            <input
              id="usuario"
              type="text"
              value={usuario}
              onChange={(event) => setUsuario(event.target.value)}
              placeholder="Digite seu usuário"
              autoComplete="username"
              required
            />
          </div>

          <div className="campo-login">
            <div className="linha-senha">
              <label htmlFor="senha">
                Senha
              </label>
              <Link to="/esqueci-senha" className="acao-login-recuperacao">
                Esqueci minha senha
              </Link>
            </div>

            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              placeholder="Digite sua senha"
              autoComplete="current-password"
              required
            />
          </div>

          {erro && (
            <p className="erro-login" role="alert">
              {erro}
            </p>
          )}

          <button
            className="botao-entrar"
            type="submit"
            disabled={enviando}
          >
            {enviando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="acoes-login">
          <p className="acao-login-cadastro">
            Ainda não possui uma conta?{" "}
            <Link to="/cadastro">Criar cadastro</Link>
          </p>
        </div>
      </section>
    </LayoutPublico>
  );
}

export default Login;
