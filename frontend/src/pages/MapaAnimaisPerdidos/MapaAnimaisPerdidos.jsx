import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";

import { api } from "../../services/api.js";
import "leaflet/dist/leaflet.css";
import "./MapaAnimaisPerdidos.css";


const GUANAMBI = [-14.2231, -42.7798];


function criarIconeAnimal(nome) {
  const letra = nome?.charAt(0)?.toUpperCase() || "🐾";

  return L.divIcon({
    className: "marcador-animal-perdido",
    html: `<span>${letra}</span>`,
    iconSize: [42, 42],
    iconAnchor: [21, 42],
    popupAnchor: [0, -40],
  });
}


function AjustarVisualizacao({ animais }) {
  const mapa = useMap();

  useEffect(() => {
    if (animais.length === 0) {
      mapa.setView(GUANAMBI, 13);
      return;
    }

    if (animais.length === 1) {
      mapa.setView(
        [animais[0].latitude, animais[0].longitude],
        15,
      );
      return;
    }

    const limites = L.latLngBounds(
      animais.map((animal) => [
        animal.latitude,
        animal.longitude,
      ]),
    );

    mapa.fitBounds(limites, {
      padding: [50, 50],
      maxZoom: 15,
    });
  }, [animais, mapa]);

  return null;
}


function MapaAnimaisPerdidos() {
  const [animais, setAnimais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarAnimais() {
      try {
        const response = await api.get(
          "/publico/animais-perdidos/",
        );

        const animaisComLocalizacao = response.data.filter(
          (animal) =>
            animal.latitude !== null &&
            animal.longitude !== null,
        );

        setAnimais(animaisComLocalizacao);
      } catch (error) {
        console.error("Erro ao carregar mapa:", error);

        setErro(
          "Não foi possível carregar os animais perdidos no mapa.",
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarAnimais();
  }, []);

  const quantidadeAnimais = useMemo(
    () => animais.length,
    [animais],
  );

  return (
    <main className="pagina-mapa-animais">
      <header className="cabecalho-mapa-animais">
        <Link className="logo-mapa-animais" to="/">
          <span aria-hidden="true">🐾</span>
          MyPetFound
        </Link>

        <Link className="link-voltar-mapa" to="/">
          ← Voltar para animais perdidos
        </Link>
      </header>

      <section className="cabecalho-conteudo-mapa">
        <div>
          <p className="tag-mapa-animais">
            Ajude a comunidade
          </p>

          <h1>Animais perdidos no mapa</h1>

          <p>
            Veja os últimos locais informados pelos tutores. Se reconhecer um
            animal, abra os detalhes e envie um avistamento.
          </p>
        </div>

        {!carregando && !erro && (
          <div className="contador-mapa">
            <strong>{quantidadeAnimais}</strong>

            <span>
              {quantidadeAnimais === 1
                ? "animal no mapa"
                : "animais no mapa"}
            </span>
          </div>
        )}
      </section>

      {carregando && (
        <section className="estado-mapa">
          <span className="carregador-mapa" aria-hidden="true" />

          <p>Carregando mapa...</p>
        </section>
      )}

      {!carregando && erro && (
        <section className="estado-mapa estado-erro-mapa">
          <span aria-hidden="true">⚠️</span>

          <h2>Não foi possível carregar o mapa</h2>

          <p>{erro}</p>

          <Link className="botao-voltar-mapa" to="/">
            Voltar para a página inicial
          </Link>
        </section>
      )}

      {!carregando && !erro && quantidadeAnimais === 0 && (
        <section className="estado-mapa">
          <span aria-hidden="true">📍</span>

          <h2>Nenhum ponto no mapa por enquanto</h2>

          <p>
            Existem animais perdidos sem coordenadas ou não há anúncios ativos
            no momento. Quando um tutor marcar uma localização, o pet aparecerá
            aqui.
          </p>

          <Link className="botao-voltar-mapa" to="/">
            Ver lista de animais perdidos
          </Link>
        </section>
      )}

      {!carregando && !erro && quantidadeAnimais > 0 && (
        <section className="card-mapa-animais">
          <MapContainer
            center={GUANAMBI}
            zoom={13}
            scrollWheelZoom
            className="mapa-animais-perdidos"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <AjustarVisualizacao animais={animais} />

            {animais.map((animal) => (
              <Marker
                key={animal.id}
                position={[
                  Number(animal.latitude),
                  Number(animal.longitude),
                ]}
                icon={criarIconeAnimal(animal.nome)}
              >
                <Popup>
                  <article className="popup-animal-mapa">
                    <div className="popup-foto-animal">
                      {animal.foto ? (
                        <img
                          src={animal.foto}
                          alt={`Foto de ${animal.nome}`}
                        />
                      ) : (
                        <span aria-hidden="true">🐾</span>
                      )}
                    </div>

                    <div className="popup-conteudo-animal">
                      <span className="popup-status-perdido">
                        Perdido
                      </span>

                      <h2>{animal.nome}</h2>

                      <p>
                        {animal.especie_nome} · {animal.porte_nome}
                      </p>

                      <p className="popup-localidade">
                        <span aria-hidden="true">📍</span>
                        {animal.localidade}
                      </p>

                      <Link
                        className="botao-popup-animal"
                        to={`/animais/${animal.id}`}
                      >
                        Ver detalhes
                      </Link>
                    </div>
                  </article>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          <p className="aviso-precisao-mapa">
            <span aria-hidden="true">ⓘ</span>
            Os pontos indicam o último local informado pelo tutor e podem ser
            aproximados.
          </p>
        </section>
      )}
    </main>
  );
}

export default MapaAnimaisPerdidos;