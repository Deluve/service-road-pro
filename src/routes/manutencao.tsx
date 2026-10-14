import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Botao, Panel, WearBar } from "@/components/fleet-ui";
import { fleetStore, useFleet } from "@/lib/fleet-store";
import { formatKm, formatMoeda, tecnicos, vidaUtil } from "@/lib/fleet-data";

export const Route = createFileRoute("/manutencao")({
  head: () => ({
    meta: [
      { title: "Manutenção — VULCAN Fleet Control" },
      {
        name: "description",
        content: "Vida útil das peças, alertas automáticos e registro de manutenção da frota de viaturas.",
      },
      { property: "og:title", content: "Manutenção — VULCAN Fleet Control" },
      {
        property: "og:description",
        content: "Acompanhe o desgaste das peças, receba alertas automáticos e registre serviços executados.",
      },
    ],
  }),
  component: Manutencao,
});

function Manutencao() {
  const { veiculos, alertas } = useFleet();
  const [veiculoId, setVeiculoId] = useState(veiculos[0].id);
  const [pecaId, setPecaId] = useState(veiculos[0].pecas[0].id);
  const [tecnico, setTecnico] = useState(tecnicos[0]);
  const [custo, setCusto] = useState("850");
  const [aviso, setAviso] = useState<string | null>(null);

  const veiculo = veiculos.find((v) => v.id === veiculoId) ?? veiculos[0];

  function registrar() {
    fleetStore.registrarManutencao(veiculo.id, pecaId, tecnico, Number(custo) || 0);
    const peca = veiculo.pecas.find((p) => p.id === pecaId);
    setAviso(`Manutenção registrada: ${peca?.nome} · ${veiculo.placa} — vida útil restaurada para 100%.`);
  }

  return (
    <AppShell titulo="Manutenção" sublinha="vida útil e serviços">
      <div className="grid lg:grid-cols-3 gap-4">
        <Panel
          titulo="Alertas automáticos"
          acao={<span className="text-[11px] font-mono text-crit">{alertas.length} ativos</span>}
          className="lg:col-span-1"
        >
          {alertas.length === 0 ? (
            <p className="px-4 py-6 text-xs text-muted">Nenhum alerta ativo.</p>
          ) : (
            <div className="divide-y divide-border max-h-[420px] overflow-y-auto">
              {alertas.map((a) => (
                <div key={a.id} className="px-4 py-3 flex gap-3">
                  <span
                    className={`size-2 mt-1.5 rounded-full shrink-0 ${a.nivel === "crit" ? "bg-crit vx-pulse" : "bg-warn"}`}
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold">{a.peca}</div>
                    <div className="text-[11px] font-mono text-muted mt-0.5">
                      {a.placa} · vida útil {a.percentual}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel
          titulo="Registro de manutenção"
          sublinha="reseta a vida útil da peça"
          className="lg:col-span-2"
          acao={<Botao onClick={registrar}>Registrar manutenção</Botao>}
        >
          <div className="p-4 grid sm:grid-cols-2 gap-3">
            <label className="text-xs space-y-1.5">
              <span className="text-[10px] uppercase tracking-[0.14em] text-muted">Veículo</span>
              <select
                value={veiculoId}
                onChange={(e) => {
                  setVeiculoId(e.target.value);
                  const novo = veiculos.find((v) => v.id === e.target.value);
                  if (novo) setPecaId(novo.pecas[0].id);
                }}
                className="w-full rounded-md bg-surface-2 border border-border px-3 py-2 font-mono text-sm"
              >
                {veiculos.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.placa} · {v.modelo}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs space-y-1.5">
              <span className="text-[10px] uppercase tracking-[0.14em] text-muted">Peça</span>
              <select
                value={pecaId}
                onChange={(e) => setPecaId(e.target.value)}
                className="w-full rounded-md bg-surface-2 border border-border px-3 py-2 font-mono text-sm"
              >
                {veiculo.pecas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} ({vidaUtil(p)}%)
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs space-y-1.5">
              <span className="text-[10px] uppercase tracking-[0.14em] text-muted">Técnico</span>
              <select
                value={tecnico}
                onChange={(e) => setTecnico(e.target.value)}
                className="w-full rounded-md bg-surface-2 border border-border px-3 py-2 font-mono text-sm"
              >
                {tecnicos.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs space-y-1.5">
              <span className="text-[10px] uppercase tracking-[0.14em] text-muted">Custo (MZN)</span>
              <input
                value={custo}
                onChange={(e) => setCusto(e.target.value)}
                inputMode="numeric"
                className="w-full rounded-md bg-surface-2 border border-border px-3 py-2 font-mono text-sm"
              />
            </label>
            {aviso ? (
              <p className="sm:col-span-2 text-[11px] font-mono text-ok border border-ok/30 bg-ok/10 rounded-md px-3 py-2">
                {aviso}
              </p>
            ) : null}
          </div>
        </Panel>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {veiculos.map((v) => (
          <Panel
            key={v.id}
            titulo={v.placa}
            sublinha={`${v.modelo} · ${formatKm(v.odometro)} km`}
            acao={
              <Link to="/veiculo/$id" params={{ id: v.id }} className="text-accent text-xs font-mono hover:underline">
                Abrir
              </Link>
            }
          >
            <div className="p-4 space-y-4">
              {v.pecas.map((p) => (
                <WearBar
                  key={p.id}
                  nome={p.nome}
                  pct={vidaUtil(p)}
                  restanteKm={Math.max(0, p.intervaloKm - p.usoKm)}
                />
              ))}
              <div className="pt-1 text-[11px] font-mono text-muted">
                Último serviço: {v.historico[0] ? `${v.historico[0].data} · ${formatMoeda(v.historico[0].custo)}` : "—"}
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </AppShell>
  );
}
