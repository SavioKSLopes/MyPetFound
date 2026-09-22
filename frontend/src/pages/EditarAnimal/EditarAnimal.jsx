import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { api } from "../../services/api.js";
import "./EditarAnimal.css";

function EditarAnimal() {
  const { id } = useParams();
  const navegar = useNavigate();

  const [animal, setAnimal] = useState(null);
  const [nome, setNome] = useState("");
  const [especie, setEspecie] = useState("");
  const [raca, setRaca] = useState("");
  const [porte, setPorte] = useState("");
  const [cor, setCor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [foto, setFoto] = useState(null);
  const [previewFoto, setPreviewFoto] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarAnimal() {
      try {
        setCarregando(true);
        setErro("");

        const resposta = await api.get(`/animais/${id}/`);
        const dados = resposta.data;

        setAnimal(dados);
        setNome(dados.nome || "");
        setEspecie(dados.especie || "");
        setRaca(dados.raca || "");
        setPorte(dados.porte || "");
        setCor(dados.cor || "");
        setDescricao(dados.descricao || "");
        setPreviewFoto(dados.foto || "");
      } catch (error) {
        console.error("Erro ao carregar animal:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("mypetfound_token");

          navegar("/entrar", {
            replace: true,
          });

          return;
        }

        if (error.response?.status === 404) {
          setErro(
            "Este animal não foi encontrado ou não pertence à sua conta.",
          );

          return;
        }

        setErro(
          "Não foi possível carregar os dados do animal. " +
          "Tente novamente em alguns instantes.",
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarAnimal();
  }, [id, navegar]);

  useEffect(() => {
    return () => {
      if (foto && previewFoto?.startsWith("blob:")) {
        URL.revokeObjectURL(previewFoto);
      }
    };
  }, [foto, previewFoto]);

  function trocarFoto(event) {
    const arquivo = event.target.files?.[0];

    if (!arquivo) {
      return;
    }

    if (!arquivo.type.startsWith("image/")) {
      setErro("Selecione um arquivo de imagem válido.");
      return;
    }

    if (previewFoto?.startsWith("blob:")) {
      URL.revokeObjectURL(previewFoto);
    }

    setFoto(arquivo);
    setPreviewFoto(URL.createObjectURL(arquivo));
    setErro("");
  }

  async function salvarAlteracoes(event) {
    event.preventDefault();

    setErro("");

    if (!nome.trim()) {
      setErro("Informe o nome do animal.");
      return;
    }

    if (!especie) {
      setErro("Selecione a espécie do animal.");
      return;
    }

    if (!porte) {
      setErro("Selecione o porte do animal.");
      return;
    }

    try {
      setSalvando(true);

      const dados = new FormData();

      dados.append("nome", nome.trim());
      dados.append("especie", especie);
      dados.append("raca", raca.trim());
      dados.append("porte", porte);
      dados.append("cor", cor.trim());
      dados.append("descricao", descricao.trim());

      if (foto) {
        dados.append("foto", foto);
      }

      await api.patch(
        `/animais/${id}/`,
        dados,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      navegar(`/meus-animais/${id}`, {
        replace: true,
      });
    } catch (error) {
      console.error("Erro ao atualizar animal:", error);

      const erros = error.response?.data;

      if (erros && typeof erros === "object") {
        const primeiraChave = Object.keys(erros)[0];
        const primeiraMensagem = erros[primeiraChave];

        if (Array.isArray(primeiraMensagem)) {
          setErro(primeiraMensagem[0]);
        } else if (typeof primeiraMensagem === "string") {
          setErro(primeiraMensagem);
        } else {
          setErro(
            "Não foi possível salvar as alterações. Verifique os dados.",
          );
        }

        return;
      }

      setErro(
        "Não foi possível salvar as alterações. Tente novamente.",
      );
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <main className="pagina-editar-animal">
        <section className="estado-editar-animal">
          <span className="carregador-editar" aria-hidden="true" />

          <p>Carregando dados do animal...</p>
        </section>
      </main>
    );
  }

  if (erro && !animal) {
    return (
      <main className="pagina-editar-animal">
        <section className="estado-editar-animal estado-erro-editar">
          <span aria-hidden="true">⚠️</span>

          <h1>Não foi possível editar este animal</h1>

          <p>{erro}</p>

          <Link
            className="botao-voltar-editar"
            to="/meus-animais"
          >
            Voltar para meus animais
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="pagina-editar-animal">
      <header className="cabecalho-editar-animal">
        <Link className="logo-editar-animal" to="/">
          <span aria-hidden="true">🐾</span>
          MyPetFound
        </Link>

        <Link
          className="link-voltar-editar"
          to={`/meus-animais/${id}`}
        >
          ← Voltar para gerenciamento
        </Link>
      </header>

      <section className="cabecalho-formulario-editar">
        <p className="tag-editar-animal">
          Área do tutor
        </p>

        <h1>Editar {animal.nome}</h1>

        <p>
          Mantenha as informações do seu pet atualizadas para facilitar
          a identificação caso ele desapareça.
        </p>
      </section>

      <form
        className="formulario-editar-animal"
        onSubmit={salvarAlteracoes}
      >
        <section className="card-editar-animal card-foto-editar">
          <div>
            <h2>Foto do animal</h2>

            <p>
              Use uma foto atual e nítida, de preferência mostrando o rosto
              ou características marcantes.
            </p>
          </div>

          <div className="area-foto-editar">
            <div className="preview-foto-editar">
              {previewFoto ? (
                <img
                  src={previewFoto}
                  alt={`Foto de ${nome || animal.nome}`}
                />
              ) : (
                <span aria-hidden="true">🐾</span>
              )}
            </div>

            <label className="botao-selecionar-foto">
              Trocar foto
              <input
                type="file"
                accept="image/*"
                onChange={trocarFoto}
              />
            </label>
          </div>
        </section>

        <section className="card-editar-animal">
          <div className="cabecalho-card-editar">
            <div>
              <p className="subtitulo-editar-animal">
                Informações principais
              </p>

              <h2 className="titulo-card-editar-animal">Dados do animal</h2>
            </div>

            <span aria-hidden="true">🐾</span>
          </div>

          <div className="campos-editar-animal">
            <label>
              Nome
              <input
                type="text"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                placeholder="Ex.: Luna"
                maxLength="100"
                required
              />
            </label>

            <label>
              Espécie
              <select
                value={especie}
                onChange={(event) => setEspecie(event.target.value)}
                required
              >
                <option value="">Selecione</option>
                <option value="CACHORRO">Cachorro</option>
                <option value="GATO">Gato</option>
                <option value="OUTRO">Outro</option>
              </select>
            </label>

            <label>
              Raça
              <input
                type="text"
                value={raca}
                onChange={(event) => setRaca(event.target.value)}
                placeholder="Ex.: Siamês"
                maxLength="100"
              />
            </label>

            <label>
              Porte
              <select
                value={porte}
                onChange={(event) => setPorte(event.target.value)}
                required
              >
                <option value="">Selecione</option>
                <option value="PEQUENO">Pequeno</option>
                <option value="MEDIO">Médio</option>
                <option value="GRANDE">Grande</option>
              </select>
            </label>

            <label className="campo-largo-editar">
              Cor predominante
              <input
                type="text"
                value={cor}
                onChange={(event) => setCor(event.target.value)}
                placeholder="Ex.: Preto e branco"
                maxLength="100"
              />
            </label>

            <label className="campo-largo-editar">
              Características adicionais
              <textarea
                value={descricao}
                onChange={(event) => setDescricao(event.target.value)}
                placeholder="Ex.: Possui cicatriz nas costas."
                rows="5"
                maxLength="1000"
              />
            </label>
          </div>
        </section>

        {erro && (
          <p className="mensagem-erro-editar" role="alert">
            ⚠️ {erro}
          </p>
        )}

        <div className="acoes-editar-animal">
          <Link
            className="botao-cancelar-editar"
            to={`/meus-animais/${id}`}
          >
            Cancelar
          </Link>

          <button
            className="botao-salvar-editar"
            type="submit"
            disabled={salvando}
          >
            {salvando
              ? "Salvando alterações..."
              : "Salvar alterações"}
          </button>
        </div>
      </form>
    </main>
  );
}

export default EditarAnimal;