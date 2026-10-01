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


import LayoutPublico from "../../components/layout/LayoutPublico";
import AnimalImagem from "../../components/animal/AnimalImagem";
import AnimalStatus from "../../components/animal/AnimalStatus";
import EstadoTela from "../../components/ui/EstadoTela";
import { buscarAnimais } from "../../services/animaisService.js";
import { obterNomeEspecie, obterNomePorte } from "../../utils/animal.js";
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
        const response = await buscarAnimais();

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
    <LayoutPublico className="pagina-mapa-animais">

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
        <EstadoTela tipo="carregando" className="estado-mapa">
          <span className="carregador-mapa" aria-hidden="true" />

          <p>Carregando mapa...</p>
        </EstadoTela>
      )}

      {!carregando && erro && (
        <EstadoTela tipo="erro" className="estado-mapa estado-erro-mapa">
          <span aria-hidden="true">⚠️</span>

          <h2>Não foi possível carregar o mapa</h2>

          <p>{erro}</p>

          <Link className="botao-voltar-mapa" to="/">
            Voltar para a página inicial
          </Link>
        </EstadoTela>
      )}

      {!carregando && !erro && quantidadeAnimais === 0 && (
        <EstadoTela tipo="vazio" className="estado-mapa">
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
        </EstadoTela>
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
                    <AnimalImagem src={animal.foto} nome={animal.nome} className="popup-foto-animal" />

                    <div className="popup-conteudo-animal">
                      <AnimalStatus status="PERDIDO" statusNome="Perdido" className="popup-status-perdido" />

                      <h2>{animal.nome}</h2>

                      <p>
                        {obterNomeEspecie(animal)} · {obterNomePorte(animal)}
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
    </LayoutPublico>
  );
}

export default MapaAnimaisPerdidos;
