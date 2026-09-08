import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { api } from "../services/api";
import "./Login.css";


function Login() {
  const navegar = useNavigate();
  const localizacao = useLocation();

  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  const destino = localizacao.state?.de || "/meus-animais";

  async function fazerLogin(event) {
    event.preventDefault();

    setErro("");
    setEnviando(true);

    try {
      const response = await api.post("/auth/login/", {
        username: usuario,
        password: senha,
      });

      localStorage.setItem("mypetfound_token", response.data.token);

      navegar(destino, {
        replace: true,
      });
    } catch (error) {
      console.error("Erro ao entrar:", error);

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
    <main className="pagina-login">
      <section className="painel-login">
        <Link className="logo-login" to="/">
          <span aria-hidden="true">🐾</span>
          MyPetFound
        </Link>

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
            <label htmlFor="senha">
              Senha
            </label>

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

        <p className="rodape-login">
          Ainda não possui uma conta?{" "}
          <Link to="/cadastro">
            Criar cadastro
          </Link>
        </p>

        <Link className="voltar-inicio-login" to="/">
          ← Voltar para a página inicial
        </Link>
      </section>
    </main>
  );
}

export default Login;