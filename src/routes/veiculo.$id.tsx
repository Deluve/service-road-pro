import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Botao, Panel, RouteTrace, StatusChip, WearBar } from "@/components/fleet-ui";
import { fleetStore, useFleet } from "@/lib/fleet-store";
import { formatKm, formatMoeda, vidaUtil } from "@/lib/fleet-data";

export const Route = createFileRoute("/veiculo/$id")({
  head: () => ({
    meta: [
      { title: "Detalhe do veículo — VULCAN Fleet Control" },
      { name: "description", content: "Odômetro, rota, vida útil das peças e histórico de manutenção do veículo." },
      { property: "og:title", content: "Detalhe do veículo — VULCAN Fleet Control" },
      { property: "og:description", content: "Painel individual do caminhão: peças, rota e histórico." },
    ],
  }),
  component: Detalhe,
});

function Detalhe() {
  const { id } = Route.useParams();
  const { veiculos } = useFleet();
  const v = veiculos.find((x) => x.id === id);

  if (!v) {
    return (
      <AppShell titulo="Veículo não encontrado">
        <Panel titulo="Nada por aqui">
          <div className="p-4 text-sm">
            <Link to="/" className="text-accent hover:underline">Voltar ao dashboard</Link>
          </div>
        </Panel>
      </AppShell>
    );
  }

  return (
    <AppShell titulo={v.placa} sublinha={v.modelo}>
      <div className="grid lg:grid-cols-3 gap-4">
        <Panel
          titulo="Operação"
          sublinha={`${v.origem} → ${v.destino}`}
          className="lg:col-span-2"
          acao={
            <div className="flex items-center gap-2">
              <StatusChip status={v.status} />
              <Botao onClick={() => fleetStore.alternarRastreio(v.id, !v.rastreando)}>
                {v.rastreando ? "Parar" : "Iniciar"} GPS
              </Botao>
            </div>
          }
        >
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-md bg-surface-2 border border-border p-3">
                <div className="text-[10px] uppercase tracking-[0.14em] text-muted">Odômetro</div>
                <div className="font-mono text-xl font-bold tabular-nums">{formatKm(v.odometro)}</div>
              </div>
              <div className="rounded-md bg-surface-2 border border-border p-3">
                <div className="text-[10px] uppercase tracking-[0.14em] text-muted">Km viagem</div>
                <div className="font-mono text-xl font-bold tabular-nums">{v.kmViagem.toFixed(1)}</div>
              </div>
              <div className="rounded-md bg-surface-2 border border-border p-3">
                <div className="text-[10px] uppercase tracking-[0.14em] text-muted">Velocidade</div>
                <div className="font-mono text-xl font-bold">{v.velocidade} km/h</div>
              </div>
            </div>
            <RouteTrace origem={v.origem} destino={v.destino} progresso={v.progressoRota} ativo={v.rastreando} />
          </div>
        </Panel>

        <Panel titulo="Vida útil das peças">
          <div className="p-4 space-y-3">
            {v.pecas.map((p) => (
              <WearBar key={p.id} nome={p.nome} pct={vidaUtil(p)} restanteKm={p.intervaloKm - p.usoKm} />
            ))}
          </div>
        </Panel>

        <Panel titulo="Histórico de manutenção" className="lg:col-span-3">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="text-[10px] uppercase tracking-[0.14em] text-muted border-b border-border">
                  <th className="text-left font-medium px-4 py-2">Data</th>
                  <th className="text-left font-medium px-4 py-2">Serviço</th>
                  <th className="text-left font-medium px-4 py-2">Técnico</th>
                  <th className="text-right font-medium px-4 py-2">Odômetro</th>
                  <th className="text-right font-medium px-4 py-2">Custo</th>
                  <th className="text-left font-medium px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {v.historico.map((h) => (
                  <tr key={h.id}>
                    <td className="px-4 py-3 font-mono">{h.data}</td>
                    <td className="px-4 py-3">{h.peca}</td>
                    <td className="px-4 py-3">{h.tecnico}</td>
                    <td className="px-4 py-3 text-right font-mono">{formatKm(h.odometro)}</td>
                    <td className="px-4 py-3 text-right font-mono">{formatMoeda(h.custo)}</td>
                    <td className={`px-4 py-3 font-mono text-xs ${h.status === "CONCLUÍDO" ? "text-ok" : "text-warn"}`}>{h.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
