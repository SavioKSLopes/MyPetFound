import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AnimalImagem from "../../components/animal/AnimalImagem";
import CamposAnimal from "../../components/animal/CamposAnimal";
import LayoutTutor from "../../components/layout/LayoutTutor";
import Card from "../../components/ui/Card";
import useAuth from "../../hooks/useAuth.js";
import { criarAnimal } from "../../services/animaisService.js";
import "./CadastroAnimal.css";


function CadastroAnimal() {
  const navegar = useNavigate();
  const { sair } = useAuth();

  const [nome, setNome] = useState("");
  const [especie, setEspecie] = useState("");
  const [raca, setRaca] = useState("");
  const [porte, setPorte] = useState("");
  const [cor, setCor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState("");

  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  function selecionarFoto(event) {
    const arquivo = event.target.files?.[0] || null;

    setFoto(arquivo);

    if (fotoPreview) {
      URL.revokeObjectURL(fotoPreview);
    }

    if (arquivo) {
      setFotoPreview(URL.createObjectURL(arquivo));
    } else {
      setFotoPreview("");
    }
  }

  function atualizarCampo(campo, valor) {
    const setters = { nome: setNome, especie: setEspecie, raca: setRaca, porte: setPorte, cor: setCor, descricao: setDescricao };
    setters[campo](valor);
  }

  async function cadastrarAnimal(event) {
    event.preventDefault();

    setErro("");
    setEnviando(true);

    const dados = new FormData();

    dados.append("nome", nome);
    dados.append("especie", especie);
    dados.append("raca", raca);
    dados.append("porte", porte);
    dados.append("cor", cor);
    dados.append("descricao", descricao);

    if (foto) {
      dados.append("foto", foto);
    }

    try {
      await criarAnimal(dados);

      navegar("/meus-animais", {
        replace: true,
      });
    } catch (error) {
      console.error("Erro ao cadastrar animal:", error);

      if (error.response?.status === 401) {
        sair("/entrar");

        return;
      }

      const errosDaApi = error.response?.data;

      if (errosDaApi) {
        const primeiroCampo = Object.keys(errosDaApi)[0];
        const mensagem = errosDaApi[primeiroCampo];

        setErro(
          Array.isArray(mensagem)
            ? mensagem[0]
            : "Verifique os dados preenchidos e tente novamente.",
        );
      } else {
        setErro(
          "Não foi possível cadastrar o animal. " +
          "Verifique se o backend está em execução.",
        );
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <LayoutTutor className="pagina-cadastro-animal">
      <div className="acoes-contextuais-cadastro">
        <Link className="voltar-painel" to="/meus-animais">
          ← Voltar para meus animais
        </Link>
      </div>

      <section className="conteudo-cadastro-animal">
        <div className="introducao-cadastro-animal">
          <p className="tag-cadastro-animal">
            Área do tutor
          </p>

          <h1>Cadastre seu animal</h1>

          <p>
            Mantenha as características e uma foto do seu pet atualizadas.
            Assim, se ele desaparecer, será mais rápido criar um anúncio e
            pedir ajuda à comunidade.
          </p>

          <div className="aviso-cadastro-animal">
            <span aria-hidden="true">🔒</span>

            <p>
              Os dados do tutor não são exibidos publicamente. Apenas as
              informações necessárias para identificar o pet poderão aparecer
              em um anúncio de desaparecimento.
            </p>
          </div>
        </div>

        <Card as="section" className="card-cadastro-animal">
          <form onSubmit={cadastrarAnimal}>
            <div className="cabecalho-formulario-animal">
              <h2>Dados do pet</h2>

              <p>
                Os campos marcados com * são obrigatórios.
              </p>
            </div>

            <div className="campo-foto-animal">
              <label htmlFor="foto">
                Foto principal <span>(opcional)</span>
              </label>

              <div className="area-upload-foto">
                <AnimalImagem
                  src={fotoPreview}
                  nome={nome || "selecionada"}
                  alt="Prévia da foto selecionada"
                  className="preview-foto-animal"
                />

                <div className="conteudo-upload-foto">
                  <label
                    className="botao-escolher-foto"
                    htmlFor="foto"
                  >
                    Escolher foto
                  </label>

                  <input
                    id="foto"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={selecionarFoto}
                  />

                  <p>
                    Use uma foto nítida em que o animal seja facilmente
                    reconhecido.
                  </p>
                </div>
              </div>
            </div>

            <CamposAnimal
              modo="cadastro"
              valores={{ nome, especie, raca, porte, cor, descricao }}
              aoAlterar={atualizarCampo}
            />

            {erro && (
              <p className="erro-cadastro-animal" role="alert">
                {erro}
              </p>
            )}

            <div className="acoes-cadastro-animal">
              <Link
                className="botao-cancelar-cadastro"
                to="/meus-animais"
              >
                Cancelar
              </Link>

              <button
                className="botao-salvar-animal"
                type="submit"
                disabled={enviando}
              >
                {enviando
                  ? "Salvando..."
                  : "Cadastrar animal"}
              </button>
            </div>
          </form>
        </Card>
      </section>
    </LayoutTutor>
  );
}

export default CadastroAnimal;
