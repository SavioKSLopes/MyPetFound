import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { api } from "../services/api";
import "./CadastroAnimal.css";


function CadastroAnimal() {
  const navegar = useNavigate();

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
      await api.post("/animais/", dados, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      navegar("/meus-animais", {
        replace: true,
      });
    } catch (error) {
      console.error("Erro ao cadastrar animal:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("mypetfound_token");

        navegar("/entrar", {
          replace: true,
        });

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
    <main className="pagina-cadastro-animal">
      <header className="cabecalho-cadastro-animal">
        <Link className="logo-cadastro-animal" to="/">
          <span aria-hidden="true">🐾</span>
          MyPetFound
        </Link>

        <Link className="voltar-painel" to="/meus-animais">
          ← Voltar para meus animais
        </Link>
      </header>

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

        <section className="card-cadastro-animal">
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
                <div className="preview-foto-animal">
                  {fotoPreview ? (
                    <img
                      src={fotoPreview}
                      alt="Prévia da foto selecionada"
                    />
                  ) : (
                    <span aria-hidden="true">🐾</span>
                  )}
                </div>

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

            <div className="grid-campos-animal">
              <div className="campo-cadastro-animal campo-largo">
                <label htmlFor="nome">
                  Nome do animal *
                </label>

                <input
                  id="nome"
                  type="text"
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                  placeholder="Ex.: Luna"
                  maxLength="100"
                  required
                />
              </div>

              <div className="campo-cadastro-animal">
                <label htmlFor="especie">
                  Espécie *
                </label>

                <select
                  id="especie"
                  value={especie}
                  onChange={(event) => setEspecie(event.target.value)}
                  required
                >
                  <option value="">Selecione</option>
                  <option value="CACHORRO">Cachorro</option>
                  <option value="GATO">Gato</option>
                  <option value="OUTRO">Outro</option>
                </select>
              </div>

              <div className="campo-cadastro-animal">
                <label htmlFor="porte">
                  Porte *
                </label>

                <select
                  id="porte"
                  value={porte}
                  onChange={(event) => setPorte(event.target.value)}
                  required
                >
                  <option value="">Selecione</option>
                  <option value="PEQUENO">Pequeno</option>
                  <option value="MEDIO">Médio</option>
                  <option value="GRANDE">Grande</option>
                </select>
              </div>

              <div className="campo-cadastro-animal">
                <label htmlFor="raca">
                  Raça
                </label>

                <input
                  id="raca"
                  type="text"
                  value={raca}
                  onChange={(event) => setRaca(event.target.value)}
                  placeholder="Ex.: SRD, Poodle, Siamês"
                  maxLength="100"
                />
              </div>

              <div className="campo-cadastro-animal">
                <label htmlFor="cor">
                  Cor predominante *
                </label>

                <input
                  id="cor"
                  type="text"
                  value={cor}
                  onChange={(event) => setCor(event.target.value)}
                  placeholder="Ex.: Caramelo"
                  maxLength="100"
                  required
                />
              </div>

              <div className="campo-cadastro-animal campo-largo">
                <label htmlFor="descricao">
                  Características e observações
                </label>

                <textarea
                  id="descricao"
                  value={descricao}
                  onChange={(event) => setDescricao(event.target.value)}
                  placeholder="Ex.: Possui uma mancha branca no peito, usa coleira vermelha e é bastante dócil."
                  rows="5"
                />
              </div>
            </div>

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
        </section>
      </section>
    </main>
  );
}

export default CadastroAnimal;