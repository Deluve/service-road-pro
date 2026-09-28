import { useSyncExternalStore } from "react";
import {
  veiculosIniciais,
  vidaUtil,
  severidade,
  type Vehicle,
  type MaintenanceRecord,
} from "./fleet-data";

export type Alerta = {
  id: string;
  veiculoId: string;
  placa: string;
  peca: string;
  pecaId: string;
  nivel: "warn" | "crit";
  percentual: number;
  criadoEm: number;
};

type State = {
  veiculos: Vehicle[];
  alertas: Alerta[];
  tick: number;
};

let state: State = {
  veiculos: veiculosIniciais.map((v) => ({ ...v, pecas: v.pecas.map((p) => ({ ...p })) })),
  alertas: [],
  tick: 0,
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function setState(updater: (s: State) => State) {
  state = updater(state);
  state = { ...state, alertas: recalcAlertas(state) };
  emit();
}

function recalcAlertas(s: State): Alerta[] {
  const agora = Date.now();
  const antigos = new Map(s.alertas.map((a) => [a.id, a]));
  const lista: Alerta[] = [];
  for (const v of s.veiculos) {
    for (const p of v.pecas) {
      const pct = vidaUtil(p);
      const sev = severidade(pct);
      if (sev === "ok") continue;
      const id = `${v.id}:${p.id}`;
      lista.push({
        id,
        veiculoId: v.id,
        placa: v.placa,
        peca: p.nome,
        pecaId: p.id,
        nivel: sev,
        percentual: pct,
        criadoEm: antigos.get(id)?.criadoEm ?? agora,
      });
    }
  }
  return lista.sort((a, b) => (a.nivel === b.nivel ? a.percentual - b.percentual : a.nivel === "crit" ? -1 : 1));
}

state = { ...state, alertas: recalcAlertas(state) };

/** 1 segundo real = 1 minuto de operação (simulação acelerada) */
const FATOR = 60;

function avancar(v: Vehicle, segundos: number): Vehicle {
  const emMovimento = v.rastreando || v.status === "em_rota" || v.status === "critico";
  if (!emMovimento) return v;
  const km = (v.velocidade / 3600) * segundos * FATOR;
  return {
    ...v,
    odometro: v.odometro + km,
    kmViagem: v.rastreando ? v.kmViagem + km : v.kmViagem,
    progressoRota: Math.min(1, v.progressoRota + km / 600),
    pecas: v.pecas.map((p) => ({ ...p, usoKm: Math.min(p.intervaloKm, p.usoKm + km) })),
  };
}

let intervalo: ReturnType<typeof setInterval> | null = null;

function garantirSimulacao() {
  if (intervalo || typeof window === "undefined") return;
  intervalo = setInterval(() => {
    setState((s) => ({
      ...s,
      tick: s.tick + 1,
      veiculos: s.veiculos.map((v) => avancar(v, 1)),
    }));
  }, 1000);
}

export const fleetStore = {
  subscribe(l: () => void) {
    listeners.add(l);
    garantirSimulacao();
    return () => {
      listeners.delete(l);
    };
  },
  getSnapshot() {
    return state;
  },
  getServerSnapshot() {
    return state;
  },
  alternarRastreio(id: string, ativo: boolean) {
    setState((s) => ({
      ...s,
      veiculos: s.veiculos.map((v) =>
        v.id === id
          ? {
              ...v,
              rastreando: ativo,
              kmViagem: ativo ? 0 : v.kmViagem,
              progressoRota: ativo ? 0 : v.progressoRota,
              status: ativo ? (v.status === "critico" ? "critico" : "em_rota") : "parado",
            }
          : v,
      ),
    }));
  },
  registrarManutencao(veiculoId: string, pecaId: string, tecnico: string, custo: number) {
    setState((s) => ({
      ...s,
      veiculos: s.veiculos.map((v) => {
        if (v.id !== veiculoId) return v;
        const peca = v.pecas.find((p) => p.id === pecaId);
        if (!peca) return v;
        const registro: MaintenanceRecord = {
          id: `${veiculoId}-${pecaId}-${Date.now()}`,
          data: new Date().toLocaleDateString("pt-BR"),
          peca: peca.nome,
          tecnico,
          odometro: Math.round(v.odometro),
          custo,
          status: "CONCLUÍDO",
        };
        const pecas = v.pecas.map((p) => (p.id === pecaId ? { ...p, usoKm: 0 } : p));
        const aindaCritico = pecas.some((p) => vidaUtil(p) <= 20);
        return {
          ...v,
          pecas,
          historico: [registro, ...v.historico],
          status: aindaCritico ? "critico" : v.rastreando ? "em_rota" : v.status === "critico" ? "parado" : v.status,
        };
      }),
    }));
  },
};

export function useFleet() {
  return useSyncExternalStore(fleetStore.subscribe, fleetStore.getSnapshot, fleetStore.getServerSnapshot);
}
