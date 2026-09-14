import type {
  SumarioQueimadas,
  Municipio,
  Ocorrencia,
  VisaoGeralRisco,
  SumarioVegetacao,
  SumarioAgua,
  SumarioClima,
} from '../types';

async function obterJson<T>(caminho: string): Promise<T> {
  const resposta = await fetch(`/api${caminho}`);
  if (!resposta.ok) throw new Error(`Falha ao consultar ${caminho}: ${resposta.status}`);
  return resposta.json();
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
