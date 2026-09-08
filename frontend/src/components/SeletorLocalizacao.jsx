import { useEffect } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "./SeletorLocalizacao.css";


const GUANAMBI = [-14.2231, -42.7798];


const iconeMarcador = L.divIcon({
  className: "marcador-mypetfound",
  html: "<span>🐾</span>",
  iconSize: [42, 42],
  iconAnchor: [21, 38],
});


function CliqueNoMapa({ valor, aoSelecionar }) {
  useMapEvents({
    click(event) {
      aoSelecionar({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
    },
  });

  return valor ? (
    <Marker
      position={[valor.latitude, valor.longitude]}
      icon={iconeMarcador}
    />
  ) : null;
}


function CentralizarNoPonto({ valor }) {
  const mapa = useMap();

  useEffect(() => {
    if (valor) {
      mapa.flyTo(
        [valor.latitude, valor.longitude],
        Math.max(mapa.getZoom(), 15),
        {
          duration: 0.65,
        },
      );
    }
  }, [mapa, valor]);

  return null;
}


function SeletorLocalizacao({ valor, aoSelecionar }) {
  return (
    <section className="seletor-localizacao">
      <div className="cabecalho-seletor-localizacao">
        <div>
          <h3>Marque o último local visto</h3>

          <p>
            Clique no mapa para posicionar o marcador. Você pode arrastar o
            mapa e aproximar a região antes de selecionar o ponto.
          </p>
        </div>

        {valor && (
          <button
            className="botao-limpar-localizacao"
            type="button"
            onClick={() => aoSelecionar(null)}
          >
            Limpar ponto
          </button>
        )}
      </div>

      <div className="mapa-container">
        <MapContainer
          center={GUANAMBI}
          zoom={13}
          scrollWheelZoom
          className="mapa-seletor-localizacao"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <CliqueNoMapa
            valor={valor}
            aoSelecionar={aoSelecionar}
          />

          <CentralizarNoPonto valor={valor} />
        </MapContainer>
      </div>

      {valor ? (
        <p className="localizacao-selecionada">
          <span aria-hidden="true">✓</span>
          Ponto selecionado no mapa.
        </p>
      ) : (
        <p className="localizacao-nao-selecionada">
          <span aria-hidden="true">📍</span>
          Nenhum ponto selecionado. O mapa é opcional, mas ajuda a comunidade
          a localizar a área do desaparecimento.
        </p>
      )}
    </section>
  );
}

export default SeletorLocalizacao;