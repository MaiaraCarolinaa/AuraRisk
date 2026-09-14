import NodeCache from 'node-cache';

export const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

export async function buscarComCache<T>(
  chave: string,
  ttlSegundos: number,
  carregador: () => Promise<T>,
  deveArmazenar: (valor: T) => boolean = () => true,
): Promise<T> {
  const valorEmCache = cache.get<T>(chave);
  if (valorEmCache !== undefined) return valorEmCache;
  const valor = await carregador();
  if (deveArmazenar(valor)) cache.set(chave, valor, ttlSegundos);
  return valor;
}
