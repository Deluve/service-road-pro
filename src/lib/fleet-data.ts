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

export const especificacoes: { rotulo: string; valor: string }[] = [
  { rotulo: "Motor", valor: "Toyota 3B · 4 cilindros em linha · Diesel" },
  { rotulo: "Cilindrada", valor: "3.431 cc (3.4 litros)" },
  { rotulo: "Potência", valor: "≈ 85–98 hp (85–90 cv)" },
  { rotulo: "Alimentação", valor: "Bomba injetora manual" },
  { rotulo: "Transmissão", valor: "Caixa manual de 5 velocidades" },
  { rotulo: "Tração", valor: "Traseira (2WD)" },
  { rotulo: "Lotação", valor: "26 lugares" },
  { rotulo: "Direção", valor: "Assistida (hidráulica)" },
  { rotulo: "Suspensão", valor: "Molas parabólicas/helicoidais" },
  { rotulo: "Peso bruto (PBV)", valor: "≈ 6.600 kg" },
];

export const sintomas: { grupo: string; itens: string[] }[] = [
  {
    grupo: "Direção e suspensão dianteira",
    itens: [
      "Folga vertical e lateral na roda dianteira",
      "Estalos secos (\"clac-clac\") ao manobrar",
      "Desgaste irregular dos pneus (interno/externo)",
      "Direção pesada, desalinhada ou com folga",
      "Rangidos metálicos nas rótulas e terminais",
      "Batidas secas (\"tuc-tuc\") na suspensão dianteira",
      "Frente da viatura \"arreada\" ou desalinhada",
      "Oscilação e instabilidade (\"saltitar\") em velocidade",
    ],
  },
  {
    grupo: "Suspensão traseira",
    itens: [
      "Ranger seco (\"crec-crec\") no feixe de molas traseiro",
      "Fuga da traseira (\"dançar\") em curvas",
      "Desalinhamento do eixo traseiro",
    ],
  },
  {
    grupo: "Travões",
    itens: [
      "Pedal de travão/embraiagem esponjoso ou a afundar",
      "Pedal duro ou travões colados",
      "Fuga de fluido de travão",
      "Chiado metálico ao travar",
      "Vibração no volante durante a travagem",
      "Travão de mão fraco ou inoperante",
    ],
  },
  {
    grupo: "Embraiagem e transmissão",
    itens: [
      "Embraiagem a patinar",
      "Dificuldade e arranhar ao engatar mudanças",
      "Ruído ao pisar o pedal de embraiagem",
    ],
  },
  {
    grupo: "Cubos e rodas",
    itens: [
      "Zumbido ou ronco metálico nos cubos das rodas",
      "Fuga de graxa/óleo para os discos e balatas",
    ],
  },
];

const peca = (id: string, nome: string, intervaloKm: number, f: number): Part => ({
  id,
  nome,
  intervaloKm,
  usoKm: Math.round(intervaloKm * f),
});

export const veiculosIniciais: Vehicle[] = [
  {
    id: "coaster-01",
    placa: "AFB-237-MC",
    modelo: "Toyota Coaster 3B · 26 lugares",
    odometro: 287450,
    origem: "Maputo",
    destino: "Xai-Xai",
    velocidade: 70,
    status: "em_rota",
    rastreando: false,
    kmViagem: 0,
    progressoRota: 0.35,
    pecas: [
      peca("oleo", "Óleo do motor + filtro", 7500, 0.84),
      peca("combustivel", "Filtro de combustível", 15000, 0.6),
      peca("ar", "Filtro de ar", 10000, 0.72),
      peca("travoes", "Travões (pastilhas/sapatas)", 30000, 0.5),
      peca("pneus", "Pneus (pressão e desgaste)", 60000, 0.45),
      peca("suspensao", "Suspensão (molas, amortecedores, buchas)", 40000, 0.62),
      peca("embraiagem", "Embraiagem", 80000, 0.38),
      peca("arrefecimento", "Sistema de arrefecimento", 40000, 0.3),
      peca("correias", "Correias", 50000, 0.55),
      peca("caixa", "Óleo da caixa e diferencial", 40000, 0.48),
      peca("direcao", "Direção (folgas e alinhamento)", 20000, 0.66),
      peca("bateria", "Bateria e alternador", 50000, 0.25),
    ],
    historico: [
      { id: "h1", data: "17/09/2026", peca: "Óleo do motor + filtro", tecnico: "G. Ferrão", odometro: 281150, custo: 4500, status: "CONCLUÍDO" },
      { id: "h2", data: "02/08/2026", peca: "Travões (pastilhas/sapatas)", tecnico: "C. Duarte", odometro: 272450, custo: 9800, status: "CONCLUÍDO" },
      { id: "h3", data: "10/07/2026", peca: "Direção (folgas e alinhamento)", tecnico: "R. Alves", odometro: 274250, custo: 3200, status: "PENDENTE" },
    ],
  },
];

export const tecnicos = ["G. Ferrão", "C. Duarte", "R. Alves", "M. Souza", "J. Nogueira", "M. Rocha"];

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
