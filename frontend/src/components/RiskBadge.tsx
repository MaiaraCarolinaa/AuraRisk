import type { NivelRisco } from '../types';

const ROTULOS: Record<NivelRisco, string> = {
  baixo: 'Baixo',
  moderado: 'Moderado',
  alto: 'Alto',
  critico: 'Crítico',
  indisponivel: 'Sem dado',
};

const ESTILOS: Record<NivelRisco, string> = {
  baixo: 'bg-risk-low/10 text-risk-low',
  moderado: 'bg-risk-moderate/10 text-risk-moderate',
  alto: 'bg-risk-high/10 text-risk-high',
  critico: 'bg-risk-critical/10 text-risk-critical',
  indisponivel: 'bg-risk-unknown/10 text-risk-unknown',
};

export default function SeloRisco({ nivel }: { nivel: NivelRisco }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${ESTILOS[nivel]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {ROTULOS[nivel]}
    </span>
  );
}

export function PontoAoVivo({ aoVivo }: { aoVivo: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-neutral-500">
      <span className={`w-1.5 h-1.5 rounded-full ${aoVivo ? 'bg-risk-low animate-pulse' : 'bg-neutral-300'}`} />
      {aoVivo ? 'Ao vivo' : 'Indisponível'}
    </span>
  );
}
