import type { ReactNode } from 'react';
import type { NivelRisco } from '../types';
import SeloRisco from './RiskBadge';

interface PropriedadesCartaoArea {
  icone: ReactNode;
  corFundoIcone: string;
  corIcone: string;
  rotulo: string;
  valor: string;
  status?: NivelRisco;
  nota?: string;
  aoClicar?: () => void;
}

export default function CartaoArea({ icone, corFundoIcone, corIcone, rotulo, valor, status, nota, aoClicar }: PropriedadesCartaoArea) {
  return (
    <button
      type="button"
      onClick={aoClicar}
      className="flex flex-col items-center text-center gap-3 bg-white rounded-2xl border border-black/5 shadow-card px-4 py-6 hover:-translate-y-0.5 hover:shadow-md transition-all"
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${corFundoIcone}`} style={{ color: corIcone }}>
        {icone}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-neutral-800">{rotulo}</p>
        <p className="text-xs text-neutral-500">{valor}</p>
      </div>
      {status && <SeloRisco nivel={status} />}
      {nota && !status && <p className="text-[11px] text-neutral-400 leading-snug">{nota}</p>}
    </button>
  );
}
