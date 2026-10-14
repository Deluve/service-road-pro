import { useSyncExternalStore } from "react";
import {
  veiculosIniciais,
  vidaUtil,
  severidade,
  isPecaCritica,
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

/** 1 segundo real = 8 segundos de operação */
const FATOR = 8;

function atualizaStatusVeiculo(v: Vehicle): VehicleStatus {
  if (v.rastreando) {
    return v.pecas.some((p) => isPecaCritica(p)) ? "critico" : "em_rota";
  }

  if (v.status === "manutencao") return "manutencao";
  if (v.pecas.some((p) => isPecaCritica(p))) return "critico";
  return "parado";
}

function avancar(v: Vehicle, segundos: number): Vehicle {
  if (!v.rastreando) {
    return {
      ...v,
      velocidade: 0,
      status: atualizaStatusVeiculo(v),
    };
  }

  const critico = v.pecas.some((p) => isPecaCritica(p));
  const baseVelocidade = 48 + Math.random() * 42;
  const desgaste = v.pecas.reduce((acc, p) => acc + Math.max(0, 100 - vidaUtil(p)), 0) / Math.max(v.pecas.length, 1);
  const velocidade = Math.round(
    Math.max(22, Math.min(102, baseVelocidade + (Math.sin((v.odometro + Date.now()) / 1800) * 14) - desgaste * 0.28 - (critico ? 20 : 0))),
  );
  const km = (velocidade / 3600) * segundos * FATOR * 1.25;

  const pecas = v.pecas.map((p) => {
    const desgastePorKm = (100 - vidaUtil(p)) / 120 + 0.055;
    const usoKm = Number(Math.min(p.intervaloKm, p.usoKm + km * desgastePorKm * (critico ? 2.2 : 1.3)).toFixed(2));
    return { ...p, usoKm };
  });

  const status = critico ? "critico" : "em_rota";

  return {
    ...v,
    odometro: Number((v.odometro + km).toFixed(1)),
    kmViagem: Number((v.kmViagem + km).toFixed(1)),
    progressoRota: Math.min(1, v.progressoRota + km / 600),
    velocidade,
    pecas,
    status,
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
      veiculos: s.veiculos.map((v) => {
        if (v.id !== id) return v;

        const critico = v.pecas.some((p) => isPecaCritica(p));

        if (ativo) {
          return {
            ...v,
            rastreando: true,
            kmViagem: 0,
            progressoRota: 0,
            velocidade: Math.round(52 + Math.random() * 18),
            status: critico ? "critico" : "em_rota",
          };
        }

        return {
          ...v,
          rastreando: false,
          velocidade: 0,
          status: critico ? "critico" : "parado",
        };
      }),
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
        const aindaCritico = pecas.some((p) => isPecaCritica(p));
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
