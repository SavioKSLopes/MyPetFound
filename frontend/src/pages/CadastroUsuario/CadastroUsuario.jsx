import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Botao from "../../components/ui/Botao.jsx";
import CampoFormulario from "../../components/ui/CampoFormulario.jsx";
import Card from "../../components/ui/Card.jsx";
import LayoutPublico from "../../components/layout/LayoutPublico.jsx";
import useAuth from "../../hooks/useAuth.js";
import { cadastrarUsuario } from "../../services/usuariosService.js";
import "./CadastroUsuario.css";

const formularioInicial = {
  nome: "",
  email: "",
  username: "",
  senha: "",
  confirmacaoSenha: "",
};

const camposApi = {
  first_name: "nome",
  last_name: "nome",
  email: "email",
  username: "username",
  password: "senha",
  password_confirmation: "confirmacaoSenha",
};

function validarFormulario(formulario) {
  const erros = {};
  const nome = formulario.nome.trim();
  const email = formulario.email.trim();

  if (!nome) {
    erros.nome = "Informe seu nome completo.";
  }

  if (!email) {
    erros.email = "Informe seu e-mail.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    erros.email = "Informe um e-mail válido.";
  }

  if (!formulario.username.trim()) {
    erros.username = "Informe um nome de usuário para entrar.";
  }

  if (!formulario.senha) {
    erros.senha = "Informe uma senha.";
  } else if (formulario.senha.length < 8) {
    erros.senha = "A senha deve ter pelo menos 8 caracteres.";
  } else if (/^\d+$/.test(formulario.senha)) {
    erros.senha = "A senha não pode conter somente números.";
  }

  if (!formulario.confirmacaoSenha) {
    erros.confirmacaoSenha = "Confirme sua senha.";
  } else if (formulario.senha !== formulario.confirmacaoSenha) {
    erros.confirmacaoSenha = "As senhas informadas não conferem.";
  }

  return erros;
}

function mensagensDoErro(valor) {
  const valores = Array.isArray(valor) ? valor : [valor];

  return valores.filter((mensagem) => typeof mensagem === "string");
}

function obterErrosDaApi(error) {
  const dados = error.response?.data;

  if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
    return {
      campos: {},
      geral: "Não foi possível criar a conta. Tente novamente em instantes.",
    };
  }

  const campos = {};
  const gerais = [];

  Object.entries(dados).forEach(([campoApi, valor]) => {
    const mensagens = mensagensDoErro(valor);
    const campo = camposApi[campoApi];

    if (campo) {
      campos[campo] = [...(campos[campo] || []), ...mensagens].join(" ");
    } else {
      gerais.push(...mensagens);
    }
  });

  return {
    campos,
    geral: gerais.join(" ") ||
      (Object.keys(campos).length
        ? "Confira os campos destacados e tente novamente."
        : "Não foi possível criar a conta. Tente novamente em instantes."),
  };
}

function CadastroUsuario() {
  const navegar = useNavigate();
  const { autenticar } = useAuth();
  const [formulario, setFormulario] = useState(formularioInicial);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState("");
  const [salvando, setSalvando] = useState(false);

  function atualizarCampo(event) {
    const { name, value } = event.target;
    setFormulario((atual) => ({ ...atual, [name]: value }));
    setErros((atuais) => ({ ...atuais, [name]: undefined }));
    setErroGeral("");
  }

  async function enviarCadastro(event) {
    event.preventDefault();

    if (salvando) {
      return;
    }

    setErroGeral("");

    const errosFormulario = validarFormulario(formulario);
    setErros(errosFormulario);

    if (Object.keys(errosFormulario).length > 0) {
      return;
    }

    setSalvando(true);

    const partesNome = formulario.nome.trim().split(/\s+/);
    const [primeiroNome, ...restanteNome] = partesNome;

    try {
      const resposta = await cadastrarUsuario({
        username: formulario.username.trim(),
        email: formulario.email.trim(),
        password: formulario.senha,
        password_confirmation: formulario.confirmacaoSenha,
        first_name: primeiroNome,
        last_name: restanteNome.join(" "),
      });

      setFormulario((atual) => ({
        ...atual,
        senha: "",
        confirmacaoSenha: "",
      }));

      if (autenticar(resposta.data?.token, "/meus-animais")) {
        return;
      }

      navegar("/entrar", {
        replace: true,
        state: {
          mensagemSucesso: "Conta criada com sucesso. Entre para continuar.",
        },
      });
    } catch (error) {
      const resultado = obterErrosDaApi(error);
      setErros(resultado.campos);
      setErroGeral(resultado.geral);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <LayoutPublico className="pagina-cadastro-usuario">
      <Card
        as="section"
        className="painel-cadastro-usuario"
        aria-labelledby="titulo-cadastro-usuario"
      >
        <header className="cabecalho-cadastro-usuario">
          <p className="etiqueta-cadastro-usuario">Área do tutor</p>
          <h1 id="titulo-cadastro-usuario">Crie sua conta</h1>
          <p>
            Cadastre-se para registrar seus animais e acompanhar ocorrências,
            avistamentos e mensagens.
          </p>
        </header>

        <form
          className="formulario-cadastro-usuario"
          onSubmit={enviarCadastro}
          noValidate
        >
          <CampoFormulario
            id="nome"
            label="Nome completo"
            erro={erros.nome}
            required
          >
            <input
              name="nome"
              type="text"
              autoComplete="name"
              value={formulario.nome}
              onChange={atualizarCampo}
              maxLength={300}
              required
            />
          </CampoFormulario>

          <CampoFormulario
            id="email"
            label="E-mail"
            erro={erros.email}
            required
          >
            <input
              name="email"
              type="email"
              autoComplete="email"
              value={formulario.email}
              onChange={atualizarCampo}
              maxLength={254}
              required
            />
          </CampoFormulario>

          <CampoFormulario
            id="username"
            label="Nome de usuário"
            ajuda="Você usará este nome para entrar na sua conta."
            erro={erros.username}
            required
          >
            <input
              name="username"
              type="text"
              autoComplete="username"
              value={formulario.username}
              onChange={atualizarCampo}
              maxLength={150}
              required
            />
          </CampoFormulario>

          <CampoFormulario
            id="senha"
            label="Senha"
            ajuda="Use pelo menos 8 caracteres; o backend também verifica a segurança da senha."
            erro={erros.senha}
            required
          >
            <input
              name="senha"
              type="password"
              autoComplete="new-password"
              value={formulario.senha}
              onChange={atualizarCampo}
              required
            />
          </CampoFormulario>

          <CampoFormulario
            id="confirmacaoSenha"
            label="Confirmar senha"
            erro={erros.confirmacaoSenha}
            required
          >
            <input
              name="confirmacaoSenha"
              type="password"
              autoComplete="new-password"
              value={formulario.confirmacaoSenha}
              onChange={atualizarCampo}
              required
            />
          </CampoFormulario>

          {erroGeral && (
            <p className="erro-cadastro-usuario" role="alert">
              {erroGeral}
            </p>
          )}

          <Botao
            className="botao-cadastro-usuario"
            type="submit"
            loading={salvando}
          >
            {salvando ? "Criando conta..." : "Criar conta"}
          </Botao>
        </form>

        <p className="rodape-cadastro-usuario">
          Já tem uma conta? <Link to="/entrar">Entrar</Link>
        </p>
      </Card>
    </LayoutPublico>
  );
}

export default CadastroUsuario;
