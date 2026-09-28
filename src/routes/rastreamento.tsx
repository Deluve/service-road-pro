import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Botao, Panel, RouteTrace, StatusChip } from "@/components/fleet-ui";
import { fleetStore, useFleet } from "@/lib/fleet-store";
import { formatKm } from "@/lib/fleet-data";

export const Route = createFileRoute("/rastreamento")({
  head: () => ({
    meta: [
      { title: "Rastreamento GPS — VULCAN Fleet Control" },
      {
        name: "description",
        content: "Simulação de rastreamento GPS por veículo: inicie ou pare a rota e acompanhe os km percorridos.",
      },
      { property: "og:title", content: "Rastreamento GPS — VULCAN Fleet Control" },
      {
        property: "og:description",
        content: "Inicie ou pare o rastreamento e acompanhe km percorridos, velocidade e traçado da rota.",
      },
    ],
  }),
  component: Rastreamento,
});

function Rastreamento() {
  const { veiculos } = useFleet();
  const [selecionado, setSelecionado] = useState(veiculos[0].id);
  const v = veiculos.find((x) => x.id === selecionado) ?? veiculos[0];

  return (
    <AppShell titulo="Rastreamento" sublinha="simulação GPS">
      <div className="grid lg:grid-cols-3 gap-4">
        <Panel titulo="Unidades" sublinha="selecione para rastrear" className="lg:col-span-1">
          <div className="divide-y divide-border">
            {veiculos.map((x) => (
              <button
                key={x.id}
                onClick={() => setSelecionado(x.id)}
                className={`w-full text-left px-4 py-3 hover:bg-surface-2/50 ${x.id === v.id ? "bg-surface-2/70" : ""}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-accent text-sm">{x.placa}</span>
                  <StatusChip status={x.status} />
                </div>
                <div className="text-[11px] font-mono text-muted mt-1">
                  {x.modelo} · {formatKm(x.odometro)} km
                </div>
              </button>
            ))}
          </div>
        </Panel>

        <Panel
          titulo={`${v.placa} · ${v.modelo}`}
          sublinha={`${v.origem} → ${v.destino}`}
          className="lg:col-span-2"
          acao={
            <div className="flex items-center gap-2">
              <Botao onClick={() => fleetStore.alternarRastreio(v.id, true)}>Iniciar</Botao>
              <Botao variante="contorno" onClick={() => fleetStore.alternarRastreio(v.id, false)}>
                Parar
              </Botao>
            </div>
          }
        >
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="rounded-md bg-surface-2 border border-border p-3">
                <div className="text-[10px] uppercase tracking-[0.14em] text-muted">Km da viagem</div>
                <div className="font-mono text-2xl font-bold tabular-nums">{v.kmViagem.toFixed(1)}</div>
              </div>
              <div className="rounded-md bg-surface-2 border border-border p-3">
                <div className="text-[10px] uppercase tracking-[0.14em] text-muted">Velocidade</div>
                <div className="font-mono text-2xl font-bold">
                  {v.rastreando ? v.velocidade : 0}
                  <span className="text-muted text-sm"> km/h</span>
                </div>
              </div>
              <div className="rounded-md bg-surface-2 border border-border p-3">
                <div className="text-[10px] uppercase tracking-[0.14em] text-muted">Odômetro</div>
                <div className="font-mono text-2xl font-bold tabular-nums">{formatKm(v.odometro)}</div>
              </div>
              <div className="rounded-md bg-surface-2 border border-border p-3">
                <div className="text-[10px] uppercase tracking-[0.14em] text-muted">Sinal</div>
                <div className={`font-mono text-2xl font-bold ${v.rastreando ? "text-ok" : "text-muted"}`}>
                  {v.rastreando ? "ATIVO" : "OFF"}
                </div>
              </div>
            </div>
            <RouteTrace origem={v.origem} destino={v.destino} progresso={v.progressoRota} ativo={v.rastreando} />
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
