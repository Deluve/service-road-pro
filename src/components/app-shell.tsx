import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { useFleet } from "@/lib/fleet-store";

const nav = [
  { to: "/", label: "Frota" },
  { to: "/rastreamento", label: "Rastreamento" },
  { to: "/manutencao", label: "Manutenção" },
  { to: "/relatorios", label: "Relatórios" },
] as const;

function Relogio() {
  const [agora, setAgora] = useState<Date | null>(null);
  useEffect(() => {
    setAgora(new Date());
    const id = setInterval(() => setAgora(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="text-right leading-tight">
      <div className="text-[11px] font-mono text-muted">
        {agora ? agora.toLocaleTimeString("pt-BR") : "--:--:--"}
      </div>
      <div className="text-[11px] font-mono text-foreground uppercase">
        {agora ? agora.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
      </div>
    </div>
  );
}

export function AppShell({ titulo, sublinha, children }: { titulo: string; sublinha?: string; children: ReactNode }) {
  const { alertas } = useFleet();
  const criticos = alertas.filter((a) => a.nivel === "crit").length;
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background text-foreground font-display antialiased">
      <div className="mx-auto flex max-w-[1440px]">
        <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-border bg-surface/60 min-h-screen sticky top-0">
          <div className="px-5 py-5 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="size-8 grid place-items-center bg-accent/15 text-accent rounded-md font-mono font-bold text-sm">
                VX
              </div>
              <div className="leading-tight">
                <div className="font-bold tracking-tight text-[15px]">VULCAN</div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-muted">Fleet Control</div>
              </div>
            </div>
          </div>
          <nav className="px-3 py-4 space-y-1 text-sm">
            {nav.map((item) => {
              const ativo = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center justify-between gap-3 px-3 py-2 rounded-md ${
                    ativo
                      ? "bg-accent/10 text-accent font-semibold border-l-2 border-accent"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  <span>{item.label}</span>
                  {item.label === "Manutenção" && criticos > 0 ? (
                    <span className="font-mono text-[10px] text-crit">{criticos}</span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto px-5 py-4 border-t border-border">
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted">Turno</div>
            <div className="text-sm font-semibold">Operador · L. Ramos</div>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <header className="sticky top-0 z-10 bg-background/85 backdrop-blur border-b border-border">
            <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="md:hidden font-bold tracking-tight">VULCAN</span>
                <h1 className="text-base sm:text-lg font-bold tracking-tight truncate">{titulo}</h1>
                {sublinha ? <span className="hidden sm:inline text-[11px] font-mono text-muted">/ {sublinha}</span> : null}
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface border border-border">
                  <span className="size-2 rounded-full bg-ok vx-pulse" />
                  <span className="text-[11px] font-mono text-muted">SISTEMA ONLINE</span>
                </div>
                <Relogio />
              </div>
            </div>
            <nav className="md:hidden flex gap-1 overflow-x-auto px-3 pb-2 text-xs">
              {nav.map((item) => {
                const ativo = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`px-3 py-1.5 rounded-md whitespace-nowrap ${
                      ativo ? "bg-accent/10 text-accent font-semibold" : "text-muted"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </header>

          <div className="px-4 sm:px-5 py-5 space-y-5">{children}</div>
        </main>
      </div>
    </div>
  );
}
