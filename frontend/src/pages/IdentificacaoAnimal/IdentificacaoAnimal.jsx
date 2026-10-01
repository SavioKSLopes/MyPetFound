import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { api } from "../../services/api.js";
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

        const resposta = await api.get(
          `/publico/identificacao/${codigo}/`,
        );

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
    <main className="pagina-identificacao-animal">
      <header className="cabecalho-identificacao-animal">
        <Link to="/" className="logo-identificacao-animal">
          <span aria-hidden="true">🐾</span>
          MyPetFound
        </Link>
      </header>

      <section className="card-identificacao-animal">
        {carregando && (
          <p role="status">Carregando identificação...</p>
        )}

        {!carregando && erro && (
          <>
            <h1>Identificação indisponível</h1>
            <p role="alert">{erro}</p>
          </>
        )}

        {!carregando && !erro && animal && (
          <>
            <div className="foto-identificacao-animal">
              {animal.foto ? (
                <img
                  src={animal.foto}
                  alt={`Foto de ${animal.nome}`}
                />
              ) : (
                <span aria-hidden="true">🐾</span>
              )}
            </div>

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
              </dl>

              <p className="aviso-identificacao-animal">
                Esta página identifica o animal. Um meio seguro de
                avisar o tutor será acrescentado em breve.
              </p>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default IdentificacaoAnimal;