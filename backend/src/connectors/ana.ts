import { XMLParser } from 'fast-xml-parser';
import { buscarComCache } from '../cache.js';
import { ANA_MT_CODIGOS_ESTACOES } from '../config.js';
import type { NivelRisco, LeituraAgua, EstacaoAgua, SumarioAgua } from '../types.js';

const URL_BASE = 'http://telemetriaws1.ana.gov.br/ServiceANA.asmx';

const analisadorXml = new XMLParser({ ignoreAttributes: false, removeNSPrefix: true });

function paraLista<T>(valor: T | T[] | undefined): T[] {
  if (valor === undefined) return [];
  return Array.isArray(valor) ? valor : [valor];
}

function dataBr(data: Date): string {
  const dia = String(data.getUTCDate()).padStart(2, '0');
  const mes = String(data.getUTCMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}/${data.getUTCFullYear()}`;
}

interface MetaEstacao {
  codigo: string;
  nome: string;
  lat: number;
  lon: number;
  rioCodigo: string | null;
}

async function buscarMetaEstacao(codigo: string): Promise<MetaEstacao | null> {
  const url = `${URL_BASE}/HidroInventario?codEstDE=${codigo}&codEstATE=${codigo}&tpEst=&nmEst=&nmRio=&codSubBacia=&codBacia=&nmMunicipio=&nmEstado=&sgResp=&sgOper=&telemetrica=`;
  const resposta = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  if (!resposta.ok) return null;
  const xml = await resposta.text();
  const json = analisadorXml.parse(xml);
  const diffgram = json?.DataSet?.diffgram ?? {};
  const blocoTabela = Object.values(diffgram).find((v: any) => v && typeof v === 'object' && 'Table' in v) as any;
  const linhas = paraLista<any>(blocoTabela?.Table);
  const linha = linhas[0];
  if (!linha) return null;
  return {
    codigo,
    nome: linha.Nome ?? codigo,
    lat: Number(linha.Latitude),
    lon: Number(linha.Longitude),
    rioCodigo: linha.RioCodigo ?? null,
  };
}

async function buscarUltimaLeitura(codigo: string): Promise<LeituraAgua | null> {
  const fim = new Date();
  const inicio = new Date(fim);
  inicio.setUTCDate(inicio.getUTCDate() - 10);
  const url = `${URL_BASE}/DadosHidrometeorologicos?codEstacao=${codigo}&dataInicio=${dataBr(inicio)}&dataFim=${dataBr(fim)}&horaDeReferencia=`;
  const resposta = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  if (!resposta.ok) return null;
  const xml = await resposta.text();
  const json = analisadorXml.parse(xml);
  const elementoDocumento = json?.DataTable?.diffgram?.DocumentElement ?? {};
  if ('ErrorTable' in elementoDocumento) return null;
  const chaveLinhas = Object.keys(elementoDocumento)[0];
  const linhas = paraLista<any>(chaveLinhas ? elementoDocumento[chaveLinhas] : undefined);
  if (linhas.length === 0) return null;
  const ultima = linhas[linhas.length - 1];
  return {
    dataHora: ultima.DataHora ?? ultima.Data_Hora ?? ultima.DataHoraAtualizacao ?? '',
    cota: ultima.Nivel_Adotado !== undefined ? Number(ultima.Nivel_Adotado) : null,
    vazao: ultima.Vazao_Adotada !== undefined ? Number(ultima.Vazao_Adotada) : null,
    chuva: ultima.Chuva_Adotada !== undefined ? Number(ultima.Chuva_Adotada) : null,
  };
}

function statusPorEstacoes(comLeitura: number, total: number): NivelRisco {
  if (total === 0) return 'indisponivel';
  const proporcao = comLeitura / total;
  if (proporcao >= 0.5) return 'baixo';
  if (proporcao >= 0.2) return 'moderado';
  return 'alto';
}

async function carregarAgua(): Promise<SumarioAgua> {
  let aoVivo = true;
  let estacoes: EstacaoAgua[] = [];

  try {
    estacoes = await Promise.all(
      ANA_MT_CODIGOS_ESTACOES.map(async (codigo) => {
        const meta = await buscarMetaEstacao(codigo);
        const leitura = await buscarUltimaLeitura(codigo).catch(() => null);
        return {
          codigo,
          nome: meta?.nome ?? codigo,
          lat: meta?.lat ?? 0,
          lon: meta?.lon ?? 0,
          rioCodigo: meta?.rioCodigo ?? null,
          ultimaLeitura: leitura,
          status: leitura ? 'com_leitura' : 'sem_leitura',
        } satisfies EstacaoAgua;
      }),
    );
  } catch {
    aoVivo = false;
  }

  const comLeitura = estacoes.filter((estacao) => estacao.status === 'com_leitura').length;

  return {
    fonte: 'ANA / SNIRH (HidroWebService - Telemetria)',
    aoVivo: aoVivo && estacoes.length > 0,
    atualizadoEm: new Date().toISOString(),
    estacoesMonitoradas: estacoes.length,
    estacoesComLeitura: comLeitura,
    status: statusPorEstacoes(comLeitura, estacoes.length),
    estacoes,
  };
}

export function obterSumarioAgua(): Promise<SumarioAgua> {
  return buscarComCache('ana:water:mt', 900, carregarAgua, (valor) => valor.aoVivo);
}
