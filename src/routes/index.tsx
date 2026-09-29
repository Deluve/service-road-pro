import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Kpi, Panel, StatusChip } from "@/components/fleet-ui";
import { useFleet } from "@/lib/fleet-store";
import { formatKm } from "@/lib/fleet-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Frota — VULCAN Fleet Control" },
      {
        name: "description",
        content:
          "Painel de operação da frota de caminhões pesados: odômetro em tempo real, status por veículo e alertas de manutenção.",
      },
      { property: "og:title", content: "Frota — VULCAN Fleet Control" },
      {
        property: "og:description",
        content: "Painel de operação da frota de caminhões pesados com odômetro em tempo real e alertas de manutenção.",
      },
    ],
  }),
  component: Frota,
});

function Frota() {
  const { veiculos, alertas } = useFleet();
  const ativos = veiculos.filter((v) => v.status === "em_rota" || v.status === "critico").length;
  const kmHoje = veiculos.reduce((acc, v) => acc + v.kmViagem, 0);
  const criticos = alertas.filter((a) => a.nivel === "crit").length;
  const eficiencia = Math.round(((veiculos.length - criticos / 2) / veiculos.length) * 100);

  return (
    <AppShell titulo="Frota" sublinha="painel de operação">
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi rotulo="Veículos ativos" valor={String(ativos).padStart(2, "0")} sufixo={`/${veiculos.length}`} />
        <Kpi rotulo="Km rodados hoje" valor={formatKm(kmHoje)} />
        <Kpi rotulo="Alertas críticos" valor={String(criticos).padStart(2, "0")} tom="crit" />
        <Kpi rotulo="Eficiência de frota" valor={String(eficiencia)} sufixo="%" tom="accent" />
      </section>

      <Panel
        titulo="Veículos da frota"
        acao={<span className="text-[11px] font-mono text-muted">{veiculos.length} unidades</span>}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[680px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.14em] text-muted border-b border-border">
                <th className="text-left font-medium px-4 py-2">Placa</th>
                <th className="text-left font-medium px-4 py-2">Modelo</th>
                <th className="text-right font-medium px-4 py-2">Odômetro</th>
                <th className="text-left font-medium px-4 py-2">Status</th>
                <th className="text-left font-medium px-4 py-2">Alertas</th>
                <th className="text-right font-medium px-4 py-2">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {veiculos.map((v) => {
                const dele = alertas.filter((a) => a.veiculoId === v.id);
                const crit = dele.filter((a) => a.nivel === "crit").length;
                return (
                  <tr key={v.id} className="hover:bg-surface-2/50">
                    <td className="px-4 py-3 font-mono font-bold text-accent">{v.placa}</td>
                    <td className="px-4 py-3">{v.modelo}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">
                      {formatKm(v.odometro)}
                      <span className="text-muted text-xs"> km</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusChip status={v.status} />
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-mono text-xs ${crit ? "text-crit" : dele.length ? "text-warn" : "text-muted"}`}>
                        {dele.length}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to="/veiculo/$id"
                        params={{ id: v.id }}
                        className="text-accent text-xs font-mono hover:underline"
                      >
                        Detalhes
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel
        titulo="Alertas automáticos"
        acao={<span className="text-[11px] font-mono text-crit">{alertas.length} ativos</span>}
      >
        {alertas.length === 0 ? (
          <p className="px-4 py-6 text-xs text-muted">Nenhum alerta ativo. Toda a frota dentro dos limites.</p>
        ) : (
          <div className="divide-y divide-border">
            {alertas.slice(0, 6).map((a) => (
              <Link
                key={a.id}
                to="/veiculo/$id"
                params={{ id: a.veiculoId }}
                className="px-4 py-3 flex gap-3 hover:bg-surface-2/50"
              >
                <span
                  className={`size-2 mt-1.5 rounded-full shrink-0 ${a.nivel === "crit" ? "bg-crit vx-pulse" : "bg-warn"}`}
                />
                <div>
                  <div className="text-xs font-semibold">
                    {a.peca} — {a.nivel === "crit" ? "desgaste crítico" : "atenção"}
                  </div>
                  <div className="text-[11px] font-mono text-muted mt-0.5">
                    {a.placa} · vida útil {a.percentual}%
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Panel>
    </AppShell>
  );
}
