import type {
  SumarioQueimadas,
  Municipio,
  Ocorrencia,
  VisaoGeralRisco,
  SumarioVegetacao,
  SumarioAgua,
  SumarioClima,
} from '../types';

const URL_BASE_API = import.meta.env.VITE_API_URL ?? '';

const TTL_CACHE_MS = 2 * 60 * 1000;
const cacheEmMemoria = new Map<string, { valor: unknown; expiraEm: number }>();

async function obterJson<T>(caminho: string): Promise<T> {
  const emCache = cacheEmMemoria.get(caminho);
  if (emCache && emCache.expiraEm > Date.now()) {
    return emCache.valor as T;
  }

  const resposta = await fetch(`${URL_BASE_API}/api${caminho}`);
  if (!resposta.ok) throw new Error(`Falha ao consultar ${caminho}: ${resposta.status}`);
  const dados = (await resposta.json()) as T;
  cacheEmMemoria.set(caminho, { valor: dados, expiraEm: Date.now() + TTL_CACHE_MS });
  return dados;
}

export const api = {
  visaoGeral: () => obterJson<VisaoGeralRisco>('/overview'),
  queimadas: () => obterJson<SumarioQueimadas>('/fires'),
  agua: () => obterJson<SumarioAgua>('/water'),
  clima: () => obterJson<SumarioClima>('/weather'),
  vegetacao: () => obterJson<SumarioVegetacao>('/vegetation'),
  municipios: () => obterJson<Municipio[]>('/municipios'),
  ocorrencias: () => obterJson<{ atualizadoEm: string; total: number; ocorrencias: Ocorrencia[] }>('/occurrences'),
};
