export type VehicleStatus = "em_rota" | "manutencao" | "parado" | "critico";

export type Part = {
  id: string;
  nome: string;
  /** Vida útil total em km */
  intervaloKm: number;
  /** Km rodados desde a última manutenção */
  usoKm: number;
};

export type MaintenanceRecord = {
  id: string;
  data: string;
  peca: string;
  tecnico: string;
  odometro: number;
  custo: number;
  status: "CONCLUÍDO" | "PENDENTE";
};

export type Vehicle = {
  id: string;
  placa: string;
  modelo: string;
  odometro: number;
  origem: string;
  destino: string;
  velocidade: number;
  status: VehicleStatus;
  rastreando: boolean;
  kmViagem: number;
  progressoRota: number;
  pecas: Part[];
  historico: MaintenanceRecord[];
};

const pecasBase = (f: number[]): Part[] => [
  { id: "freio", nome: "Freio de serviço", intervaloKm: 60000, usoKm: Math.round(60000 * f[0]) },
  { id: "oleo", nome: "Óleo do motor", intervaloKm: 30000, usoKm: Math.round(30000 * f[1]) },
  { id: "pneus", nome: "Pneus eixo traseiro", intervaloKm: 90000, usoKm: Math.round(90000 * f[2]) },
  { id: "bateria", nome: "Bateria", intervaloKm: 120000, usoKm: Math.round(120000 * f[3]) },
  { id: "ar", nome: "Sistema de ar", intervaloKm: 150000, usoKm: Math.round(150000 * f[4]) },
  { id: "embreagem", nome: "Embreagem", intervaloKm: 200000, usoKm: Math.round(200000 * f[5]) },
];

export const veiculosIniciais: Vehicle[] = [
  {
    id: "trk-4821",
    placa: "TRK-4821",
    modelo: "Scania R 500",
    odometro: 482190,
    origem: "Maputo",
    destino: "Beira",
    velocidade: 72,
    status: "em_rota",
    rastreando: false,
    kmViagem: 0,
    progressoRota: 0.42,
    pecas: pecasBase([0.82, 0.56, 0.48, 0.19, 0.1, 0.3]),
    historico: [
      { id: "h1", data: "03/02/2025", peca: "Troca de óleo", tecnico: "C. Duarte", odometro: 468300, custo: 680, status: "CONCLUÍDO" },
      { id: "h2", data: "15/01/2025", peca: "Substituição de freios", tecnico: "R. Alves", odometro: 461120, custo: 1240, status: "PENDENTE" },
    ],
  },
  {
    id: "trk-4822",
    placa: "TRK-4822",
    modelo: "Volvo FH 540",
    odometro: 391044,
    origem: "Beira",
    destino: "Chimoio",
    velocidade: 65,
    status: "manutencao",
    rastreando: false,
    kmViagem: 0,
    progressoRota: 0.18,
    pecas: pecasBase([0.44, 0.88, 0.35, 0.28, 0.21, 0.4]),
    historico: [
      { id: "h3", data: "28/01/2025", peca: "Alinhamento de pneus", tecnico: "M. Souza", odometro: 384900, custo: 420, status: "CONCLUÍDO" },
    ],
  },
  {
    id: "trk-4823",
    placa: "TRK-4823",
    modelo: "Mercedes Actros",
    odometro: 256780,
    origem: "Nacala",
    destino: "Lichinga",
    velocidade: 78,
    status: "em_rota",
    rastreando: false,
    kmViagem: 0,
    progressoRota: 0.66,
    pecas: pecasBase([0.22, 0.31, 0.18, 0.12, 0.08, 0.15]),
    historico: [
      { id: "h4", data: "02/01/2025", peca: "Revisão geral", tecnico: "C. Duarte", odometro: 249400, custo: 2100, status: "CONCLUÍDO" },
    ],
  },
  {
    id: "trk-4824",
    placa: "TRK-4824",
    modelo: "DAF XF 480",
    odometro: 178332,
    origem: "Pemba",
    destino: "Montepuez",
    velocidade: 68,
    status: "parado",
    rastreando: false,
    kmViagem: 0,
    progressoRota: 0,
    pecas: pecasBase([0.35, 0.42, 0.25, 0.3, 0.14, 0.2]),
    historico: [
      { id: "h5", data: "20/12/2024", peca: "Troca de bateria", tecnico: "M. Rocha", odometro: 171200, custo: 990, status: "CONCLUÍDO" },
    ],
  },
  {
    id: "trk-4825",
    placa: "TRK-4825",
    modelo: "Iveco S-Way",
    odometro: 612905,
    origem: "Tete",
    destino: "Quelimane",
    velocidade: 61,
    status: "critico",
    rastreando: false,
    kmViagem: 0,
    progressoRota: 0.31,
    pecas: pecasBase([0.94, 0.91, 0.87, 0.55, 0.42, 0.62]),
    historico: [
      { id: "h6", data: "10/01/2025", peca: "Troca de óleo", tecnico: "J. Nogueira", odometro: 601500, custo: 720, status: "CONCLUÍDO" },
    ],
  },
  {
    id: "trk-4826",
    placa: "TRK-4826",
    modelo: "Volvo FH 460",
    odometro: 132401,
    origem: "Matola",
    destino: "Xai-Xai",
    velocidade: 74,
    status: "em_rota",
    rastreando: false,
    kmViagem: 0,
    progressoRota: 0.55,
    pecas: pecasBase([0.28, 0.63, 0.22, 0.16, 0.09, 0.18]),
    historico: [
      { id: "h7", data: "05/02/2025", peca: "Inspeção de freios", tecnico: "R. Alves", odometro: 130100, custo: 310, status: "CONCLUÍDO" },
    ],
  },
];

export const tecnicos = ["C. Duarte", "R. Alves", "M. Souza", "J. Nogueira", "M. Rocha"];

export function vidaUtil(p: Part) {
  return Math.max(0, Math.min(100, Math.round((1 - p.usoKm / p.intervaloKm) * 100)));
}

export type Severidade = "ok" | "warn" | "crit";

export function severidade(pct: number): Severidade {
  if (pct <= 20) return "crit";
  if (pct <= 55) return "warn";
  return "ok";
}

export const statusLabel: Record<VehicleStatus, string> = {
  em_rota: "EM ROTA",
  manutencao: "MANUTENÇÃO",
  parado: "PARADO",
  critico: "CRÍTICO",
};

export function formatKm(n: number) {
  return n.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
}

export function formatMoeda(n: number) {
  return n.toLocaleString("pt", { style: "currency", currency: "MZN", maximumFractionDigits: 0 });
}
