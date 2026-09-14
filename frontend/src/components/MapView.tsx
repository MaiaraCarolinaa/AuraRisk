import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import type { FocoCalor, AlertaVegetacao, EstacaoAgua } from '../types';

const CENTRO_MT: [number, number] = [-12.8, -55.8];

interface PropriedadesVisualizacaoMapa {
  focos?: FocoCalor[];
  estacoesAgua?: EstacaoAgua[];
  alertasVegetacao?: AlertaVegetacao[];
  altura?: string;
  zoom?: number;
  centro?: [number, number];
  interativo?: boolean;
}

export default function VisualizacaoMapa({
  focos = [],
  estacoesAgua = [],
  alertasVegetacao = [],
  altura = '100%',
  zoom = 6,
  centro = CENTRO_MT,
  interativo = true,
}: PropriedadesVisualizacaoMapa) {
  return (
    <MapContainer
      center={centro}
      zoom={zoom}
      style={{ height: altura, width: '100%' }}
      scrollWheelZoom={interativo}
      dragging={interativo}
      doubleClickZoom={interativo}
      zoomControl={interativo}
      touchZoom={interativo}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {focos.map((foco) => (
        <CircleMarker
          key={foco.id}
          center={[foco.lat, foco.lon]}
          radius={5}
          pathOptions={{ color: '#c73b3b', fillColor: '#e0692f', fillOpacity: 0.85, weight: 1 }}
        >
          <Popup>
            <div className="text-xs space-y-1">
              <p className="font-semibold text-sm">🔥 Foco de calor — {foco.municipio}</p>
              <p>Bioma: {foco.bioma}</p>
              <p>Satélite: {foco.satelite}</p>
              <p>Risco de fogo: {foco.riscoFogo ?? '—'}</p>
              <p>FRP: {foco.frp ?? '—'} MW</p>
              <p className="text-neutral-400">{foco.dataHoraGmt} (UTC)</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}

      {estacoesAgua.map((estacao) => (
        <CircleMarker
          key={estacao.codigo}
          center={[estacao.lat, estacao.lon]}
          radius={6}
          pathOptions={{
            color: '#1e5f8f',
            fillColor: estacao.status === 'com_leitura' ? '#2b7fc1' : '#9db6c9',
            fillOpacity: 0.9,
            weight: 1.5,
          }}
        >
          <Popup>
            <div className="text-xs space-y-1">
              <p className="font-semibold text-sm">💧 {estacao.nome}</p>
              <p>Código ANA: {estacao.codigo}</p>
              {estacao.ultimaLeitura ? (
                <>
                  <p>Cota: {estacao.ultimaLeitura.cota ?? '—'} cm</p>
                  <p>Vazão: {estacao.ultimaLeitura.vazao ?? '—'} m³/s</p>
                  <p className="text-neutral-400">{estacao.ultimaLeitura.dataHora}</p>
                </>
              ) : (
                <p className="text-neutral-400">Sem leitura recente disponível.</p>
              )}
            </div>
          </Popup>
        </CircleMarker>
      ))}

      {alertasVegetacao
        .filter((alerta) => alerta.lat !== null && alerta.lon !== null)
        .map((alerta) => (
          <CircleMarker
            key={alerta.codigo}
            center={[alerta.lat as number, alerta.lon as number]}
            radius={6}
            pathOptions={{ color: '#7a5230', fillColor: '#a9713f', fillOpacity: 0.85, weight: 1 }}
          >
            <Popup>
              <div className="text-xs space-y-1">
                <p className="font-semibold text-sm">🌳 Alerta de desmatamento</p>
                <p>Área: {alerta.areaHa ?? '—'} ha</p>
                <p>Município: {alerta.municipios[0] ?? '—'}</p>
                <p className="text-neutral-400">{alerta.detectadoEm}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
    </MapContainer>
  );
}
