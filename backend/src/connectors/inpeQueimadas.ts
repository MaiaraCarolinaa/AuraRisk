import { buscarComCache } from '../cache.js';
import { MT_ESTADO_NOME } from '../config.js';
import type { FocoCalor, SumarioQueimadas, NivelRisco } from '../types.js';

const URL_BASE_CSV = 'https://dataserver-coids.inpe.br/queimadas/queimadas/focos/csv/diario/Brasil';

function formatarData(data: Date): string {
  const ano = data.getUTCFullYear();
  const mes = String(data.getUTCMonth() + 1).padStart(2, '0');
  const dia = String(data.getUTCDate()).padStart(2, '0');
  return `${ano}${mes}${dia}`;
}

function analisarCsv(texto: string): Record<string, string>[] {
  const linhasTexto = texto.split(/\r?\n/).filter((linha) => linha.trim().length > 0);
  if (linhasTexto.length < 2) return [];
  const cabecalho = linhasTexto[0].split(',').map((campo) => campo.trim());
  const linhas: Record<string, string>[] = [];
  for (let i = 1; i < linhasTexto.length; i++) {
    const colunas = linhasTexto[i].split(',');
    if (colunas.length < cabecalho.length) continue;
    const linha: Record<string, string> = {};
    cabecalho.forEach((campo, indice) => (linha[campo] = (colunas[indice] ?? '').trim()));
    linhas.push(linha);
  }
  return linhas;
}

function paraNumero(valor: string | undefined): number | null {
  if (valor === undefined || valor === '') return null;
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : null;
}

async function buscarCsvPorData(data: Date): Promise<string | null> {
  const url = `${URL_BASE_CSV}/focos_diario_br_${formatarData(data)}.csv`;
  const resposta = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  if (!resposta.ok) return null;
  return resposta.text();
}

function nivelRiscoPorContagem(total: number): NivelRisco {
  if (total >= 300) return 'critico';
  if (total >= 120) return 'alto';
  if (total >= 30) return 'moderado';
  return 'baixo';
}

async function buscarLinhasMtPorData(data: Date): Promise<Record<string, string>[] | null> {
  const textoCsv = await buscarCsvPorData(data);
  if (!textoCsv) return null;
  return analisarCsv(textoCsv).filter((linha) => (linha.estado ?? '').toUpperCase() === MT_ESTADO_NOME);
}

async function carregarQueimadas(): Promise<SumarioQueimadas> {
  const hoje = new Date();
  const ontem = new Date(hoje);
  ontem.setUTCDate(ontem.getUTCDate() - 1);

  let linhasMt: Record<string, string>[] | null = null;
  let dataReferencia = formatarData(hoje);
  let aoVivo = true;

  try {
    linhasMt = await buscarLinhasMtPorData(hoje);
    if (!linhasMt || linhasMt.length === 0) {
      const linhasMtOntem = await buscarLinhasMtPorData(ontem);
      if (linhasMtOntem) {
        linhasMt = linhasMtOntem;
        dataReferencia = formatarData(ontem);
      }
    }
  } catch {
    aoVivo = false;
  }

  if (!linhasMt) {
    return {
      fonte: 'INPE / Programa Queimadas (BDQueimadas)',
      aoVivo: false,
      atualizadoEm: new Date().toISOString(),
      dataReferencia,
      totalFocos: 0,
      riscoMedio: null,
      status: 'indisponivel',
      porMunicipio: [],
      focos: [],
    };
  }

  const focos: FocoCalor[] = linhasMt.map((linha) => ({
    id: linha.id,
    lat: paraNumero(linha.lat) ?? 0,
    lon: paraNumero(linha.lon) ?? 0,
    municipio: linha.municipio,
    dataHoraGmt: linha.data_hora_gmt,
    satelite: linha.satelite,
    bioma: linha.bioma,
    diasSemChuva: paraNumero(linha.numero_dias_sem_chuva),
    precipitacao: paraNumero(linha.precipitacao),
    riscoFogo: paraNumero(linha.risco_fogo),
    frp: paraNumero(linha.frp),
  }));

  const mapaPorMunicipio = new Map<string, number>();
  for (const foco of focos) {
    mapaPorMunicipio.set(foco.municipio, (mapaPorMunicipio.get(foco.municipio) ?? 0) + 1);
  }
  const porMunicipio = Array.from(mapaPorMunicipio.entries())
    .map(([municipio, contagem]) => ({ municipio, focos: contagem }))
    .sort((a, b) => b.focos - a.focos);

  const riscos = focos.map((foco) => foco.riscoFogo).filter((valor): valor is number => valor !== null);
  const riscoMedio = riscos.length > 0 ? riscos.reduce((a, b) => a + b, 0) / riscos.length : null;

  return {
    fonte: 'INPE / Programa Queimadas (BDQueimadas)',
    aoVivo,
    atualizadoEm: new Date().toISOString(),
    dataReferencia,
    totalFocos: focos.length,
    riscoMedio,
    status: nivelRiscoPorContagem(focos.length),
    porMunicipio,
    focos,
  };
}

export function obterSumarioQueimadas(): Promise<SumarioQueimadas> {
  return buscarComCache('inpe:fires:mt', 600, carregarQueimadas, (valor) => valor.aoVivo);
}
