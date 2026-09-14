import { buscarComCache } from '../cache.js';
import { MT_MUNICIPIOS } from '../config.js';
import type { NivelRisco, LeituraClima, SumarioClima } from '../types.js';

const URL_BASE = 'https://apitempo.inmet.gov.br';

async function buscarEstacaoMaisProxima(lat: number, lon: number): Promise<any | null> {
  const url = `${URL_BASE}/estacao/proxima/${lat}/${lon}`;
  const resposta = await fetch(url, { signal: AbortSignal.timeout(8_000) });
  if (!resposta.ok) return null;
  const dados = await resposta.json();
  const linha = Array.isArray(dados) ? dados[0] : dados;
  if (!linha || linha.erro) return null;
  return linha;
}

function statusPorLeituras(disponiveis: number, total: number): NivelRisco {
  if (total === 0) return 'indisponivel';
  if (disponiveis === 0) return 'indisponivel';
  if (disponiveis >= total * 0.5) return 'baixo';
  return 'moderado';
}

async function carregarClima(): Promise<SumarioClima> {
  const amostra = MT_MUNICIPIOS.slice(0, 6);

  const estacoes: LeituraClima[] = await Promise.all(
    amostra.map(async (municipio) => {
      try {
        const linha = await buscarEstacaoMaisProxima(municipio.lat, municipio.lon);
        if (!linha) {
          return {
            municipio: municipio.nome,
            lat: municipio.lat,
            lon: municipio.lon,
            codigoEstacao: null,
            dataHora: null,
            temperatura: null,
            umidade: null,
            precipitacao: null,
            ventoVelocidade: null,
            disponivel: false,
          } satisfies LeituraClima;
        }
        return {
          municipio: municipio.nome,
          lat: municipio.lat,
          lon: municipio.lon,
          codigoEstacao: linha.CD_ESTACAO ?? null,
          dataHora: linha.DT_MEDICAO ? `${linha.DT_MEDICAO} ${linha.HR_MEDICAO ?? ''}`.trim() : null,
          temperatura: linha.TEM_INS !== undefined ? Number(linha.TEM_INS) : null,
          umidade: linha.UMD_INS !== undefined ? Number(linha.UMD_INS) : null,
          precipitacao: linha.CHUVA !== undefined ? Number(linha.CHUVA) : null,
          ventoVelocidade: linha.VEN_VEL !== undefined ? Number(linha.VEN_VEL) : null,
          disponivel: true,
        } satisfies LeituraClima;
      } catch {
        return {
          municipio: municipio.nome,
          lat: municipio.lat,
          lon: municipio.lon,
          codigoEstacao: null,
          dataHora: null,
          temperatura: null,
          umidade: null,
          precipitacao: null,
          ventoVelocidade: null,
          disponivel: false,
        } satisfies LeituraClima;
      }
    }),
  );

  const disponiveis = estacoes.filter((estacao) => estacao.disponivel).length;
  const aoVivo = disponiveis > 0;

  return {
    fonte: 'INMET (apitempo.inmet.gov.br)',
    aoVivo,
    atualizadoEm: new Date().toISOString(),
    status: statusPorLeituras(disponiveis, estacoes.length),
    nota: aoVivo
      ? null
      : 'API pública do INMET indisponível a partir deste ambiente de rede no momento. O conector segue o contrato oficial e volta a funcionar assim que a conexão de saída para apitempo.inmet.gov.br estiver liberada.',
    estacoes,
  };
}

export function obterSumarioClima(): Promise<SumarioClima> {
  return buscarComCache('inmet:weather:mt', 900, carregarClima, (valor) => valor.aoVivo);
}
