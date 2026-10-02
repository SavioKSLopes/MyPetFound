import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AnimalImagem from "../../components/animal/AnimalImagem.jsx";
import AnimalStatus from "../../components/animal/AnimalStatus.jsx";
import LayoutTutor from "../../components/layout/LayoutTutor.jsx";
import Card from "../../components/ui/Card.jsx";
import EstadoTela from "../../components/ui/EstadoTela.jsx";
import SecaoCabecalho from "../../components/ui/SecaoCabecalho.jsx";
import { obterHistoricoAnimal } from "../../services/animaisService.js";
import { formatarDataHora } from "../../utils/formatadores.js";
import { ordenarEventosHistorico } from "../../utils/historico.js";
import "./HistoricoAnimal.css";

const rotulos = { CADASTRO: "Cadastro", DESAPARECIMENTO: "Desaparecimento", REENCONTRO: "Reencontro", AVISTAMENTO: "Avistamento" };

function HistoricoAnimal() {
  const { id } = useParams();
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const resposta = await obterHistoricoAnimal(id);
      setDados(resposta.data);
    } catch (error) {
      setErro(error.response?.status === 404
        ? "Animal não encontrado ou você não tem acesso a este histórico."
        : "Não foi possível carregar o histórico. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }, [id]);

  useEffect(() => {
    let ativo = true;
    obterHistoricoAnimal(id).then((resposta) => {
      if (ativo) setDados(resposta.data);
    }).catch((error) => {
      if (ativo) setErro(error.response?.status === 404
        ? "Animal não encontrado ou você não tem acesso a este histórico."
        : "Não foi possível carregar o histórico. Tente novamente.");
    }).finally(() => {
      if (ativo) setCarregando(false);
    });
    return () => { ativo = false; };
  }, [id]);

  if (erro) return (
    <LayoutTutor>
      <EstadoTela tipo="erro" titulo="Histórico indisponível" mensagem={erro} acaoTexto="Tentar novamente" aoAcionar={carregar}>
        <Link to="/meus-animais">Voltar para meus animais</Link>
      </EstadoTela>
    </LayoutTutor>
  );
  if (carregando || !dados || String(dados.animal.id) !== id) return <LayoutTutor><EstadoTela tipo="carregando" mensagem="Carregando histórico…" /></LayoutTutor>;

  const { animal, eventos } = dados;
  const ordenados = ordenarEventosHistorico(eventos);
  return (
    <LayoutTutor className="pagina-historico-animal">
      <Link to={`/meus-animais/${animal.id}`}>← Voltar ao gerenciamento</Link>
      <SecaoCabecalho etiqueta="Área do tutor" titulo={`Histórico de ${animal.nome}`} descricao="Ocorrências e avistamentos registrados para este animal, em ordem cronológica." />
      <Card className="resumo-historico">
        <AnimalImagem src={animal.foto} nome={animal.nome} className="imagem-resumo-historico" />
        <div><h2>{animal.nome}</h2><p>{animal.especie_nome || animal.especie} · {animal.porte_nome || animal.porte}</p><AnimalStatus status={animal.status} statusNome={animal.status_nome} /></div>
      </Card>
      {ordenados.length === 0 ? <EstadoTela tipo="vazio" titulo="Nenhum evento registrado" mensagem="Quando houver ocorrências ou avistamentos, eles aparecerão aqui." /> : (
        <ol className="linha-tempo-historico" aria-label="Eventos em ordem cronológica">
          {ordenados.map((evento) => (
            <li key={evento.id}>
              <Card className="evento-historico">
                <p className="etiqueta-evento">{rotulos[evento.tipo] || evento.tipo}</p>
                <h2>{evento.localidade || "Local não informado"}</h2>
                <time dateTime={evento.data_hora}>{formatarDataHora(evento.data_hora)}</time>
                {evento.descricao && <p>{evento.descricao}</p>}
                {evento.ocorrencia && <p className="referencia-ocorrencia">Ocorrência #{evento.ocorrencia.id} · {evento.ocorrencia.status_nome || evento.ocorrencia.status}</p>}
                {evento.foto && <AnimalImagem src={evento.foto} nome={`avistamento de ${animal.nome}`} className="imagem-evento-historico" />}
              </Card>
            </li>
          ))}
        </ol>
      )}
    </LayoutTutor>
  );
}

export default HistoricoAnimal;
