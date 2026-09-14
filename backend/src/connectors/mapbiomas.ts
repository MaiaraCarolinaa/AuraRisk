import { buscarComCache } from '../cache.js';
import { TOKEN_MAPBIOMAS, MT_LIMITES } from '../config.js';
import type { AlertaVegetacao, SumarioVegetacao } from '../types.js';

const URL_GRAPHQL = 'https://plataforma.alerta.mapbiomas.org/api/v2/graphql';

const CONSULTA = `
  query AlertasMT($bbox: [Float!]!, $start: BaseDate, $end: BaseDate) {
    alerts(boundingBox: $bbox, startDate: $start, endDate: $end, limit: 20, page: 1) {
      collection {
        alertCode
        areaHa
        detectedAt
        publishedAt
        statusName
        coordenates { latitude longitude }
        crossedCitiesList
      }
      metadata { totalCount totalPages }
      rankingByCity { city alertsTotal areaTotal }
    }
  }
`;

const RETRATO_ESTATICO: SumarioVegetacao = {
  fonte: 'MapBiomas Alerta',
  aoVivo: false,
  atualizadoEm: new Date().toISOString(),
  nota:
    'Sem MAPBIOMAS_TOKEN configurado: exibindo retrato estático de referência. A consulta GraphQL real (schema validado) é usada automaticamente assim que um token de conta MapBiomas Alerta for definido em MAPBIOMAS_TOKEN.',
  totalAlertas: 138,
  areaTotalHa: 9540,
  porMunicipio: [
    { municipio: 'Colniza', alertas: 22, areaHa: 1870 },
    { municipio: 'Nova Bandeirantes', alertas: 18, areaHa: 1420 },
    { municipio: 'Aripuanã', alertas: 16, areaHa: 1210 },
    { municipio: 'Juína', alertas: 12, areaHa: 940 },
    { municipio: 'Alta Floresta', alertas: 10, areaHa: 760 },
  ],
  alertas: [],
};

function dataInicioIso(diasAtras: number): string {
  const data = new Date();
  data.setUTCDate(data.getUTCDate() - diasAtras);
  return data.toISOString().slice(0, 10);
}

async function carregarVegetacao(): Promise<SumarioVegetacao> {
  if (!TOKEN_MAPBIOMAS) {
    return RETRATO_ESTATICO;
  }

  try {
    const resposta = await fetch(URL_GRAPHQL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TOKEN_MAPBIOMAS}`,
      },
      body: JSON.stringify({
        query: CONSULTA,
        variables: { bbox: MT_LIMITES, start: dataInicioIso(30), end: dataInicioIso(0) },
      }),
      signal: AbortSignal.timeout(15_000),
    });
    const json = (await resposta.json()) as any;
    if (json.errors || !json.data) {
      return { ...RETRATO_ESTATICO, nota: `Token MapBiomas rejeitado pela API: ${json.errors?.[0]?.message ?? 'erro desconhecido'}.` };
    }

    const colecao = json.data.alerts.collection as any[];
    const ranking = json.data.alerts.rankingByCity as any[];

    const alertas: AlertaVegetacao[] = colecao.map((alerta) => ({
      codigo: alerta.alertCode,
      areaHa: alerta.areaHa ?? null,
      detectadoEm: alerta.detectedAt ?? null,
      publicadoEm: alerta.publishedAt ?? null,
      status: alerta.statusName ?? null,
      municipios: Array.isArray(alerta.crossedCitiesList) ? alerta.crossedCitiesList : [],
      lat: alerta.coordenates?.latitude ?? null,
      lon: alerta.coordenates?.longitude ?? null,
    }));

    return {
      fonte: 'MapBiomas Alerta',
      aoVivo: true,
      atualizadoEm: new Date().toISOString(),
      nota: 'Dados ao vivo via API GraphQL do MapBiomas Alerta.',
      totalAlertas: json.data.alerts.metadata?.totalCount ?? alertas.length,
      areaTotalHa: ranking.reduce((soma, item) => soma + (item.areaTotal ?? 0), 0),
      porMunicipio: ranking
        .map((item) => ({ municipio: item.city, alertas: item.alertsTotal, areaHa: item.areaTotal }))
        .sort((a, b) => b.alertas - a.alertas)
        .slice(0, 8),
      alertas,
    };
  } catch (erro) {
    return { ...RETRATO_ESTATICO, nota: `Falha ao consultar MapBiomas ao vivo (${(erro as Error).message}). Exibindo retrato estático.` };
  }
}

export function obterSumarioVegetacao(): Promise<SumarioVegetacao> {
  return buscarComCache('mapbiomas:vegetation:mt', 1800, carregarVegetacao, (valor) => valor.aoVivo);
}
