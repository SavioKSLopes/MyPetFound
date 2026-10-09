import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";


import LayoutPublico from "../../components/layout/LayoutPublico";
import AnimalImagem from "../../components/animal/AnimalImagem";
import EstadoTela from "../../components/ui/EstadoTela";
import FormularioContatoTutor from "../../components/mensagens/FormularioContatoTutor.jsx";
import { obterIdentificacaoAnimal } from "../../services/animaisService.js";
import "./IdentificacaoAnimal.css";

function IdentificacaoAnimal() {
  const { codigo } = useParams();

  const [animal, setAnimal] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarAnimal() {
      try {
        setCarregando(true);
        setErro("");

        const resposta = await obterIdentificacaoAnimal(codigo);

        if (ativo) {
          setAnimal(resposta.data);
        }
      } catch (error) {
        console.error("Erro ao abrir identificação:", error);

        if (ativo) {
          setErro(
            error.response?.status === 404
              ? "Esta identificação não foi encontrada."
              : "Não foi possível carregar a identificação agora.",
          );
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregarAnimal();

    return () => {
      ativo = false;
    };
  }, [codigo]);

  return (
    <LayoutPublico className="pagina-identificacao-animal">

      <section className="card-identificacao-animal">
        {carregando && (
          <EstadoTela tipo="carregando" mensagem="Carregando identificação..." />
        )}

        {!carregando && erro && (
          <EstadoTela tipo="naoEncontrado" titulo="Identificação indisponível" mensagem={erro} />
        )}

        {!carregando && !erro && animal && (
          <>
            <AnimalImagem src={animal.foto} nome={animal.nome} className="foto-identificacao-animal" />

            <div className="dados-identificacao-animal">
              <p className="etiqueta-identificacao-animal">
                Identificação do pet
              </p>

              <h1>{animal.nome}</h1>

              <p>
                {animal.especie} · {animal.porte}
              </p>

              <dl>
                <div>
                  <dt>Raça</dt>
                  <dd>{animal.raca || "Não informada"}</dd>
                </div>

                <div>
                  <dt>Cor</dt>
                  <dd>{animal.cor || "Não informada"}</dd>
                </div>

                <div>
                  <dt>Sexo</dt>
                  <dd>{animal.sexo}</dd>
                </div>
              </dl>

              {animal.status !== "REENCONTRADO" ? (
                <FormularioContatoTutor animalId={animal.id} nomeAnimal={animal.nome} />
              ) : (
                <section className="contato-tutor" aria-live="polite">
                  <h2>Animal reencontrado</h2>
                  <p>Este animal já foi reencontrado e não está recebendo novos avisos.</p>
                </section>
              )}
            </div>
          </>
        )}
      </section>
    </LayoutPublico>
  );
}

export default IdentificacaoAnimal;
