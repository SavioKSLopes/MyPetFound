import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import LayoutTutor from "../../components/layout/LayoutTutor";
import AnimalImagem from "../../components/animal/AnimalImagem";
import CamposAnimal from "../../components/animal/CamposAnimal";
import CortadorFoto from "../../components/animal/CortadorFoto.jsx";
import Card from "../../components/ui/Card";
import EstadoTela from "../../components/ui/EstadoTela";
import useAuth from "../../hooks/useAuth.js";
import { atualizarAnimal, obterAnimalTutor } from "../../services/animaisService.js";
import "./EditarAnimal.css";

function EditarAnimal() {
  const { id } = useParams();
  const navegar = useNavigate();
  const { sair } = useAuth();

  const [animal, setAnimal] = useState(null);
  const [nome, setNome] = useState("");
  const [especie, setEspecie] = useState("");
  const [raca, setRaca] = useState("");
  const [porte, setPorte] = useState("");
  const [sexo, setSexo] = useState("");
  const [cor, setCor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [foto, setFoto] = useState(null);
  const [previewFoto, setPreviewFoto] = useState("");
  const [arquivoParaCortar, setArquivoParaCortar] = useState(null);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarAnimal() {
      try {
        setCarregando(true);
        setErro("");

        const resposta = await obterAnimalTutor(id);
        const dados = resposta.data;

        setAnimal(dados);
        setNome(dados.nome || "");
        setEspecie(dados.especie || "");
        setRaca(dados.raca || "");
        setPorte(dados.porte || "");
        setSexo(dados.sexo || "");
        setCor(dados.cor || "");
        setDescricao(dados.descricao || "");
        setPreviewFoto(dados.foto || "");
      } catch (error) {
        console.error("Erro ao carregar animal:", error);

        if (error.response?.status === 401) {
          sair("/entrar");

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
  }, [id, navegar, sair]);

  useEffect(() => {
    return () => {
      if (foto && previewFoto?.startsWith("blob:")) {
        URL.revokeObjectURL(previewFoto);
      }
    };
  }, [foto, previewFoto]);

  function atualizarCampo(campo, valor) {
    const setters = { nome: setNome, especie: setEspecie, raca: setRaca, porte: setPorte, sexo: setSexo, cor: setCor, descricao: setDescricao };
    setters[campo](valor);
  }

  function trocarFoto(event) {
    const arquivo = event.target.files?.[0];

    if (!arquivo) {
      return;
    }

    if (!arquivo.type.startsWith("image/")) {
      setErro("Selecione um arquivo de imagem válido.");
      return;
    }

    event.target.value = "";
    setArquivoParaCortar(arquivo);
    setErro("");
  }

  function confirmarFotoRecortada(arquivo) {
    setFoto(arquivo);
    setPreviewFoto(URL.createObjectURL(arquivo));
    setArquivoParaCortar(null);
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

    if (!sexo) {
      setErro("Selecione o sexo do animal.");
      return;
    }

    try {
      setSalvando(true);

      const dados = new FormData();

      dados.append("nome", nome.trim());
      dados.append("especie", especie);
      dados.append("raca", raca.trim());
      dados.append("porte", porte);
      dados.append("sexo", sexo);
      dados.append("cor", cor.trim());
      dados.append("descricao", descricao.trim());

      if (foto) {
        dados.append("foto", foto);
      }

      await atualizarAnimal(id, dados);

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
      <LayoutTutor className="pagina-editar-animal">
        <EstadoTela tipo="carregando" className="estado-editar-animal">
          <span className="carregador-editar" aria-hidden="true" />

          <p>Carregando dados do animal...</p>
        </EstadoTela>
      </LayoutTutor>
    );
  }

  if (erro && !animal) {
    return (
      <LayoutTutor className="pagina-editar-animal">
        <EstadoTela tipo="erro" className="estado-editar-animal estado-erro-editar">
          <span aria-hidden="true">⚠️</span>

          <h1>Não foi possível editar este animal</h1>

          <p>{erro}</p>

          <Link
            className="botao-voltar-editar"
            to="/meus-animais"
          >
            Voltar para meus animais
          </Link>
        </EstadoTela>
      </LayoutTutor>
    );
  }

  return (
    <LayoutTutor className="pagina-editar-animal">
      <div className="acoes-contextuais-editar">
        <Link className="link-voltar-editar" to={`/meus-animais/${id}`}>
          ← Voltar para gerenciamento
        </Link>
      </div>

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
        <Card as="section" className="card-editar-animal card-foto-editar">
          <div>
            <h2>Foto do animal</h2>

            <p>
              Use uma foto atual e nítida, de preferência mostrando o rosto
              ou características marcantes.
            </p>
          </div>

          <div className="area-foto-editar">
            <AnimalImagem src={previewFoto} nome={nome || animal.nome} className="preview-foto-editar" />

            <label className="botao-selecionar-foto">
              Trocar foto
              <input
                type="file"
                accept="image/*"
                onChange={trocarFoto}
              />
            </label>
          </div>
        </Card>

        <Card as="section" className="card-editar-animal">
          <div className="cabecalho-card-editar">
            <div>
              <p className="subtitulo-editar-animal">
                Informações principais
              </p>

              <h2 className="titulo-card-editar-animal">Dados do animal</h2>
            </div>

            <span aria-hidden="true">🐾</span>
          </div>

          <CamposAnimal
            modo="edicao"
            valores={{ nome, especie, raca, porte, sexo, cor, descricao }}
            aoAlterar={atualizarCampo}
          />
        </Card>

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
      {arquivoParaCortar && (
        <CortadorFoto
          arquivo={arquivoParaCortar}
          aoCancelar={() => setArquivoParaCortar(null)}
          aoConfirmar={confirmarFotoRecortada}
        />
      )}
    </LayoutTutor>
  );
}

export default EditarAnimal;
