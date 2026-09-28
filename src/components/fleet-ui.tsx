import type { ReactNode } from "react";
import { severidade, statusLabel, type VehicleStatus } from "@/lib/fleet-data";

export function Panel({
  titulo,
  sublinha,
  acao,
  children,
  className = "",
}: {
  titulo: string;
  sublinha?: string;
  acao?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-lg bg-surface border border-border overflow-hidden ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-border">
        <div>
          <h2 className="text-sm font-bold tracking-tight">{titulo}</h2>
          {sublinha ? <p className="text-[11px] font-mono text-muted mt-0.5">{sublinha}</p> : null}
        </div>
        {acao}
      </div>
      {children}
    </section>
  );
}

export function Kpi({ rotulo, valor, sufixo, tom }: { rotulo: string; valor: string; sufixo?: string; tom?: "crit" | "accent" }) {
  const cor = tom === "crit" ? "text-crit" : tom === "accent" ? "text-accent" : "text-foreground";
  return (
    <div className="rounded-lg bg-surface border border-border p-4 vx-rise">
      <div className="text-[10px] uppercase tracking-[0.16em] text-muted">{rotulo}</div>
      <div className={`mt-1 font-mono text-3xl font-bold ${cor}`}>
        {valor}
        {sufixo ? <span className="text-muted text-lg">{sufixo}</span> : null}
      </div>
    </div>
  );
}

const statusTom: Record<VehicleStatus, string> = {
  em_rota: "bg-ok/15 text-ok",
  manutencao: "bg-warn/15 text-warn",
  parado: "bg-muted/15 text-muted",
  critico: "bg-crit/15 text-crit",
};

const statusPonto: Record<VehicleStatus, string> = {
  em_rota: "bg-ok",
  manutencao: "bg-warn",
  parado: "bg-muted",
  critico: "bg-crit vx-pulse",
};

export function StatusChip({ status }: { status: VehicleStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono ${statusTom[status]}`}>
      <span className={`size-1.5 rounded-full ${statusPonto[status]}`} />
      {statusLabel[status]}
    </span>
  );
}

export function WearBar({ nome, pct, restanteKm }: { nome: string; pct: number; restanteKm?: number }) {
  const sev = severidade(pct);
  const cor = sev === "crit" ? "bg-crit" : sev === "warn" ? "bg-warn" : "bg-ok";
  const texto = sev === "crit" ? "text-crit" : sev === "warn" ? "text-warn" : "text-ok";
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="font-semibold">{nome}</span>
        <span className={`font-mono ${texto}`}>{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
        <div className={`h-full rounded-full ${cor} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      {restanteKm !== undefined ? (
        <div className="mt-1 text-[10px] font-mono text-muted">
          restam {restanteKm.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} km
        </div>
      ) : null}
    </div>
  );
}

export function RouteTrace({
  origem,
  destino,
  progresso,
  ativo,
}: {
  origem: string;
  destino: string;
  progresso: number;
  ativo: boolean;
}) {
  const pct = Math.round(progresso * 100);
  return (
    <div className="relative h-28 rounded-md bg-surface-2 border border-border overflow-hidden">
      <div className="absolute inset-0 opacity-40 vx-grid" />
      <div className="absolute left-0 right-0 top-1/2 h-px bg-accent/30" />
      <div className="absolute left-0 top-1/2 h-px bg-accent transition-all duration-700" style={{ width: `${pct}%` }} />
      <div
        className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-3 rounded-full bg-accent ring-4 ring-accent/20 transition-all duration-700 ${ativo ? "vx-pulse" : ""}`}
        style={{ left: `${pct}%` }}
      />
      <div className="absolute left-3 top-2 text-[10px] font-mono text-muted">ORIGEM · {origem}</div>
      <div className="absolute right-3 top-2 text-[10px] font-mono text-muted">DESTINO · {destino}</div>
      <div className="absolute left-3 bottom-2 text-[10px] font-mono text-accent">
        {ativo ? "TRAÇADO ATIVO" : "TRAÇADO PAUSADO"}
      </div>
      <div className="absolute right-3 bottom-2 text-[10px] font-mono text-muted">{pct}%</div>
    </div>
  );
}

export function Botao({
  children,
  onClick,
  variante = "solido",
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  variante?: "solido" | "contorno";
  type?: "button" | "submit";
}) {
  const estilo =
    variante === "solido"
      ? "bg-accent text-background font-bold hover:opacity-90"
      : "bg-surface-2 border border-border font-semibold hover:border-accent/50";
  return (
    <button type={type} onClick={onClick} className={`px-3 py-1.5 rounded-md text-xs transition ${estilo}`}>
      {children}
    </button>
  );
}
