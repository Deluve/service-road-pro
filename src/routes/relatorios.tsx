import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Botao, Panel } from "@/components/fleet-ui";
import { useFleet } from "@/lib/fleet-store";
import { formatKm, formatMoeda, vidaUtil } from "@/lib/fleet-data";

export const Route = createFileRoute("/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios — VULCAN Fleet Control" },
      {
        name: "description",
        content: "Relatório consolidado da frota com custos de manutenção, quilometragem e exportação em PDF.",
      },
      { property: "og:title", content: "Relatórios — VULCAN Fleet Control" },
      {
        property: "og:description",
        content: "Relatório consolidado da frota: custos, quilometragem, peças críticas e exportação em PDF.",
      },
    ],
  }),
  component: Relatorios,
});

function Relatorios() {
  const { veiculos, alertas } = useFleet();
  const custoTotal = veiculos.reduce((a, v) => a + v.historico.reduce((s, h) => s + h.custo, 0), 0);
  const servicos = veiculos.reduce((a, v) => a + v.historico.length, 0);
  const kmTotal = veiculos.reduce((a, v) => a + v.odometro, 0);

  return (
    <AppShell titulo="Relatórios" sublinha="consolidado da frota">
      <Panel
        titulo="Relatório operacional"
        sublinha={`Gerado em ${new Date().toLocaleDateString("pt-BR")} · ${veiculos.length} veículos`}
        acao={
          <div className="no-print">
            <Botao onClick={() => window.print()}>Exportar PDF</Botao>
          </div>
        }
      >
        <div className="p-4 space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-md bg-surface-2 border border-border p-3">
              <div className="text-[10px] uppercase tracking-[0.14em] text-muted">Km acumulados</div>
              <div className="font-mono text-2xl font-bold tabular-nums">{formatKm(kmTotal)}</div>
            </div>
            <div className="rounded-md bg-surface-2 border border-border p-3">
              <div className="text-[10px] uppercase tracking-[0.14em] text-muted">Serviços registrados</div>
              <div className="font-mono text-2xl font-bold">{servicos}</div>
            </div>
            <div className="rounded-md bg-surface-2 border border-border p-3">
              <div className="text-[10px] uppercase tracking-[0.14em] text-muted">Custo de manutenção</div>
              <div className="font-mono text-2xl font-bold">{formatMoeda(custoTotal)}</div>
            </div>
            <div className="rounded-md bg-surface-2 border border-border p-3">
              <div className="text-[10px] uppercase tracking-[0.14em] text-muted">Alertas abertos</div>
              <div className="font-mono text-2xl font-bold text-crit">{alertas.length}</div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="text-[10px] uppercase tracking-[0.14em] text-muted border-b border-border">
                  <th className="text-left font-medium px-4 py-2">Placa</th>
                  <th className="text-left font-medium px-4 py-2">Modelo</th>
                  <th className="text-right font-medium px-4 py-2">Odômetro</th>
                  <th className="text-left font-medium px-4 py-2">Peça mais desgastada</th>
                  <th className="text-right font-medium px-4 py-2">Custo acumulado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {veiculos.map((v) => {
                  const pior = [...v.pecas].sort((a, b) => vidaUtil(a) - vidaUtil(b))[0];
                  const pct = vidaUtil(pior);
                  const custo = v.historico.reduce((s, h) => s + h.custo, 0);
                  return (
                    <tr key={v.id}>
                      <td className="px-4 py-3 font-mono font-bold text-accent">{v.placa}</td>
                      <td className="px-4 py-3">{v.modelo}</td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums">{formatKm(v.odometro)}</td>
                      <td className="px-4 py-3">
                        {pior.nome}{" "}
                        <span className={`font-mono text-xs ${pct <= 20 ? "text-crit" : pct <= 55 ? "text-warn" : "text-ok"}`}>
                          {pct}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono">{formatMoeda(custo)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] font-mono text-muted">
            Exportação em PDF — abre a caixa de impressão do navegador com o relatório formatado.
          </p>
        </div>
      </Panel>
    </AppShell>
  );
}
