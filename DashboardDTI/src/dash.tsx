import { useMemo, useState } from "react";
import type { ReactNode, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { Line as LineChart, Radar as RadarChart } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale
} from "chart.js";
import type { ChartData, ChartOptions } from "chart.js";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import attractionsData from "./atracoes_BarraDeSaoMiguel.json";
import negociosData from "./negociosCadastrados_BarraDeSaoMiguel.json";
import { renderToStaticMarkup } from "react-dom/server";
import KpiCard from "./components/KpiCard";
import {
  FaLeaf,
  FaMountain,
  FaUniversity,
  FaWater,
  FaFootballBall,
  FaFish,
  FaBriefcase,
  FaHeartbeat,
  FaTractor,
  FaTheaterMasks,
  FaWifi,
  FaUniversalAccess,
  FaShieldAlt,
  FaBolt,
  FaRoute,
  FaLightbulb,
  FaBullhorn,
  FaRegStar
} from "react-icons/fa";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend
);

const CATEGORIES = [
  { id: "Todos", label: "Todos", icon: undefined },
  { id: "Turismo Cultural", label: "Turismo Cultural", icon: <FaTheaterMasks /> },
  { id: "Ecoturismo", label: "Ecoturismo", icon: <FaLeaf /> },
  { id: "Turismo Rural", label: "Turismo Rural", icon: <FaTractor /> },
  { id: "Turismo de Estudos e Intercâmbio", label: "Turismo de Estudos e Intercâmbio", icon: <FaUniversity /> },
  { id: "Turismo Náutico", label: "Turismo Náutico", icon: <FaWater /> },
  { id: "Turismo de Esportes", label: "Turismo de Esportes", icon: <FaFootballBall /> },
  { id: "Turismo de Aventura", label: "Turismo de Aventura", icon: <FaMountain /> },
  { id: "Turismo de Negócios e Eventos", label: "Turismo de Negócios e Eventos", icon: <FaBriefcase /> },
  { id: "Turismo de Pesca", label: "Turismo de Pesca", icon: <FaFish /> },
  { id: "Turismo de Saúde", label: "Turismo de Saúde", icon: <FaHeartbeat /> }
] as const satisfies ReadonlyArray<{
  id: string;
  label: string;
  icon?: ReactNode;
}>;

const BASE_CATEGORIES = ["Cultural", "Ecoturismo", "Agroturismo", "Urbano", "Gastronomia", "Aventura", "Negócios"] as const;
type BaseTourismCategory = typeof BASE_CATEGORIES[number];

type CategoryDefinition = typeof CATEGORIES[number];
type CategoryId = CategoryDefinition["id"];
type TourismCategory = Exclude<CategoryId, "Todos">;

const TOURISM_CATEGORIES = CATEGORIES.map((category) => category.id).filter(
  (id): id is TourismCategory => id !== "Todos"
);

const CATEGORY_BASE_MAP: Record<TourismCategory, BaseTourismCategory> = {
  "Turismo Cultural": "Cultural",
  Ecoturismo: "Ecoturismo",
  "Turismo Rural": "Agroturismo",
  "Turismo de Estudos e Intercâmbio": "Urbano",
  "Turismo Náutico": "Ecoturismo",
  "Turismo de Esportes": "Aventura",
  "Turismo de Aventura": "Aventura",
  "Turismo de Negócios e Eventos": "Negócios",
  "Turismo de Pesca": "Ecoturismo",
  "Turismo de Saúde": "Gastronomia"
};

const CATEGORY_ICON_MAP: Record<TourismCategory, ReactNode> = {
  "Turismo Cultural": <FaTheaterMasks />,
  Ecoturismo: <FaLeaf />,
  "Turismo Rural": <FaTractor />,
  "Turismo de Estudos e Intercâmbio": <FaUniversity />,
  "Turismo Náutico": <FaWater />,
  "Turismo de Esportes": <FaFootballBall />,
  "Turismo de Aventura": <FaMountain />,
  "Turismo de Negócios e Eventos": <FaBriefcase />,
  "Turismo de Pesca": <FaFish />,
  "Turismo de Saúde": <FaHeartbeat />
};

const CATEGORY_COLOR_MAP: Record<TourismCategory, string> = {
  "Turismo Cultural": "#c084fc",
  Ecoturismo: "#22c55e",
  "Turismo Rural": "#84cc16",
  "Turismo de Estudos e Intercâmbio": "#0ea5e9",
  "Turismo Náutico": "#38bdf8",
  "Turismo de Esportes": "#f97316",
  "Turismo de Aventura": "#ea580c",
  "Turismo de Negócios e Eventos": "#facc15",
  "Turismo de Pesca": "#0f766e",
  "Turismo de Saúde": "#f472b6"
};

const LEGACY_TO_NEW_CATEGORY: Record<string, TourismCategory> = {
  Cultural: "Turismo Cultural",
  "Turismo Cultural": "Turismo Cultural",
  Ecoturismo: "Ecoturismo",
  "Turismo Rural": "Turismo Rural",
  Agroturismo: "Turismo Rural",
  Urbano: "Turismo de Estudos e Intercâmbio",
  "Turismo de Estudos e Intercâmbio": "Turismo de Estudos e Intercâmbio",
  Gastronomia: "Turismo de Saúde",
  "Turismo de Saúde": "Turismo de Saúde",
  Aventura: "Turismo de Aventura",
  "Turismo de Aventura": "Turismo de Aventura",
  "Turismo de Esportes": "Turismo de Esportes",
  "Turismo Náutico": "Turismo Náutico",
  "Turismo de Negócios e Eventos": "Turismo de Negócios e Eventos",
  "Negócios": "Turismo de Negócios e Eventos",
  Negocios: "Turismo de Negócios e Eventos",
  "Turismo de Pesca": "Turismo de Pesca"
};

const ATTRACTION_CATEGORY_MAP: Record<string, TourismCategory> = {
  "Praia Barra de São Miguel": "Turismo Náutico",
  "Orla/centro de apoio (Barra de São Miguel)": "Turismo de Negócios e Eventos",
  "Praia Bonita": "Turismo Náutico",
  "Praia da Atalaia": "Turismo de Esportes",
  "Rio Niquim": "Turismo de Pesca",
  "Lagoa do Roteiro": "Turismo Náutico",
  "Praia do Gunga": "Turismo Náutico",
  "Falésias do Gunga": "Turismo de Aventura",
  "Mirante do Gunga": "Turismo Cultural",
  "Praia do Francês (bate-volta)": "Turismo Cultural"
};

function normalizeCategoryName(category?: string): TourismCategory {
  if (!category) return "Ecoturismo";
  return LEGACY_TO_NEW_CATEGORY[category] ?? "Ecoturismo";
}

const categoryIconCache = new Map<TourismCategory, L.DivIcon>();

function getCategoryMapIcon(category: TourismCategory) {
  const cached = categoryIconCache.get(category);
  if (cached) return cached;

  const iconMarkup = renderToStaticMarkup(
    <div
      style={{
        width: "32px",
        height: "32px",
        borderRadius: "999px",
        backgroundColor: "#0f172a",
        border: `3px solid ${CATEGORY_COLOR_MAP[category]}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: CATEGORY_COLOR_MAP[category],
        fontSize: "16px",
        boxShadow: "0 4px 12px rgba(2,6,23,0.4)"
      }}
    >
      {CATEGORY_ICON_MAP[category]}
    </div>
  );

  const icon = L.divIcon({
    html: iconMarkup,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -28]
  });

  categoryIconCache.set(category, icon);
  return icon;
}

/**
 * Métricas ampliadas para cobrir indicadores relevantes de DTI:
 * - Camada de demanda/experiência
 * - KPIs mínimos da norma (qualidade de vida, acessibilidade, conectividade)
 * - Métricas por eixo (versões enxutas e objetivas)
 */
type ModalShare = {
  transportePublico: number;
  shuttle: number;
  aplicativo: number;
  aluguel: number;
  micromobilidade: number;
  transporteProprio: number;
};

type CategoryMetrics = {
  // Demanda e experiência
  turistas: number;
  avaliacaoMedia: number; // 0-5
  negocios: number;
  ocupacaoHoteis: number; // 0-1
  permanenciaMediaDias: number;
  gastoMedioBRL: number;

  // KPIs mínimos DTI
  qualidadeVidaIndice: number; // 0-100
  acessibilidadeIndice: number; // 0-100
  conectividadeIndice: number; // 0-100

  // Sustentabilidade (ambiente)
  aguaLitrosPorVisitante: number;
  energiaKwhPorVisitante: number;
  residuosKgPorVisitante: number;

  // Mobilidade
  tempoMedioDeslocamentoMin: number;
  transportePublicoCoberturaPct: number;
  tempoMedioEsperaTransporteMin: number;
  satisfacaoTransportePublico: number; // 0-5

  modalShare: ModalShare;

  // Segurança
  ocorrenciasPor100k: number;

  // Inovação e tecnologia (proxy simples)
  projetosInovacaoAno: number;
  mauAppTurismo: number;

  // Criatividade
  eventosCriativosAno: number;

  // Marketing
  engajamentoDigitalPct: number; // 0-1
};

const MODAL_LABELS: Record<keyof ModalShare, string> = {
  transportePublico: "Ônibus e transporte público",
  shuttle: "Transfers/Vans",
  aplicativo: "Aplicativos de mobilidade",
  aluguel: "Carros alugados",
  micromobilidade: "Bicicletas e patinetes",
  transporteProprio: "Transporte próprio"
};

type TouristMonthData = {
  mes: string;
  ano: number;
} & Record<BaseTourismCategory, number>;

type RadarPoint = {
  eixo: string;
  valor: number; // 0-5 base (convertido para % na visualização)
};

type LineDataPoint = {
  mes: string;
  Turistas: number;
};

type Business = {
  nome: string;
  categoria: TourismCategory;
  avaliacao: number;
  acessivel: boolean;
  tipo: string;
  situacaoCadastral: "OK" | "Pendente Cadastur" | "Pendências CNPJ" | "Em análise";
};

type SortableColumn = "nome" | "categoria" | "avaliacao" | "tipo" | "acessivel" | "situacaoCadastral";

const lineChartOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { intersect: false, mode: "index" },
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { color: "#e2e8f0" } },
    y: { grid: { color: "#e5e7eb" }, ticks: { color: "#e2e8f0" } }
  },
  elements: { point: { radius: 3, hoverRadius: 5 } }
};

const radarChartOptions: ChartOptions<"radar"> = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    r: {
      suggestedMin: 0,
      suggestedMax: 100,
      ticks: {
        display: true,
        stepSize: 20,
        color: "#cbd5f5",
        backdropColor: "transparent",
        callback: (value) => `${value}%`
      },
      grid: { color: "rgba(148,163,184,0.4)" },
      angleLines: { color: "rgba(148,163,184,0.3)" },
      pointLabels: { color: "#e2e8f0", font: { size: 11 } }
    }
  },
  plugins: { legend: { display: false } }
};

// --------------------
// Dados fictícios
// --------------------

const metricsByCategory: Record<BaseTourismCategory, CategoryMetrics> = {
  Ecoturismo: {
    turistas: 12450,
    avaliacaoMedia: 4.7,
    negocios: 58,
    ocupacaoHoteis: 0.72,
    permanenciaMediaDias: 6.4,
    gastoMedioBRL: 280,

    qualidadeVidaIndice: 78,
    acessibilidadeIndice: 70,
    conectividadeIndice: 75,

    aguaLitrosPorVisitante: 210,
    energiaKwhPorVisitante: 8.2,
    residuosKgPorVisitante: 1.1,

    tempoMedioDeslocamentoMin: 28,
    transportePublicoCoberturaPct: 0.68,
    tempoMedioEsperaTransporteMin: 14,
    satisfacaoTransportePublico: 4.1,
    modalShare: {
      transportePublico: 0.34,
      shuttle: 0.18,
      aplicativo: 0.23,
      aluguel: 0.17,
      micromobilidade: 0.08,
      transporteProprio: 0.25
    },

    ocorrenciasPor100k: 120,

    projetosInovacaoAno: 6,
    mauAppTurismo: 1200,

    eventosCriativosAno: 14,

    engajamentoDigitalPct: 0.22
  },
  Aventura: {
    turistas: 9800,
    avaliacaoMedia: 4.5,
    negocios: 41,
    ocupacaoHoteis: 0.81,
    permanenciaMediaDias: 5.8,
    gastoMedioBRL: 250,

    qualidadeVidaIndice: 76,
    acessibilidadeIndice: 66,
    conectividadeIndice: 72,

    aguaLitrosPorVisitante: 230,
    energiaKwhPorVisitante: 9.1,
    residuosKgPorVisitante: 1.3,

    tempoMedioDeslocamentoMin: 32,
    transportePublicoCoberturaPct: 0.6,
    tempoMedioEsperaTransporteMin: 16,
    satisfacaoTransportePublico: 3.9,
    modalShare: {
      transportePublico: 0.28,
      shuttle: 0.25,
      aplicativo: 0.22,
      aluguel: 0.18,
      micromobilidade: 0.07,
      transporteProprio: 0.18
    },

    ocorrenciasPor100k: 150,

    projetosInovacaoAno: 5,
    mauAppTurismo: 1131,

    eventosCriativosAno: 9,

    engajamentoDigitalPct: 0.19
  },
  Urbano: {
    turistas: 30210,
    avaliacaoMedia: 4.3,
    negocios: 132,
    ocupacaoHoteis: 0.65,
    permanenciaMediaDias: 7.1,
    gastoMedioBRL: 540,

    qualidadeVidaIndice: 74,
    acessibilidadeIndice: 82,
    conectividadeIndice: 88,

    aguaLitrosPorVisitante: 190,
    energiaKwhPorVisitante: 7.4,
    residuosKgPorVisitante: 1.5,

    tempoMedioDeslocamentoMin: 22,
    transportePublicoCoberturaPct: 0.82,
    tempoMedioEsperaTransporteMin: 11,
    satisfacaoTransportePublico: 4.2,
    modalShare: {
      transportePublico: 0.45,
      shuttle: 0.15,
      aplicativo: 0.25,
      aluguel: 0.1,
      micromobilidade: 0.05,
      transporteProprio: 0.2
    },

    ocorrenciasPor100k: 180,

    projetosInovacaoAno: 10,
    mauAppTurismo: 494,

    eventosCriativosAno: 36,

    engajamentoDigitalPct: 0.28
  },
  Gastronomia: {
    turistas: 5600,
    avaliacaoMedia: 4.8,
    negocios: 23,
    ocupacaoHoteis: 0.54,
    permanenciaMediaDias: 6.6,
    gastoMedioBRL: 920,

    qualidadeVidaIndice: 80,
    acessibilidadeIndice: 73,
    conectividadeIndice: 74,

    aguaLitrosPorVisitante: 200,
    energiaKwhPorVisitante: 8.0,
    residuosKgPorVisitante: 1.0,

    tempoMedioDeslocamentoMin: 30,
    transportePublicoCoberturaPct: 0.7,
    tempoMedioEsperaTransporteMin: 13,
    satisfacaoTransportePublico: 4,
    modalShare: {
      transportePublico: 0.38,
      shuttle: 0.2,
      aplicativo: 0.24,
      aluguel: 0.12,
      micromobilidade: 0.06,
      transporteProprio: 0.18
    },

    ocorrenciasPor100k: 95,

    projetosInovacaoAno: 4,
    mauAppTurismo: 2142,

    eventosCriativosAno: 11,

    engajamentoDigitalPct: 0.17
  },
  Agroturismo: {
    turistas: 4300,
    avaliacaoMedia: 4.4,
    negocios: 19,
    ocupacaoHoteis: 0.48,
    permanenciaMediaDias: 6.9,
    gastoMedioBRL: 610,

    qualidadeVidaIndice: 77,
    acessibilidadeIndice: 62,
    conectividadeIndice: 68,

    aguaLitrosPorVisitante: 240,
    energiaKwhPorVisitante: 9.6,
    residuosKgPorVisitante: 1.2,

    tempoMedioDeslocamentoMin: 35,
    transportePublicoCoberturaPct: 0.55,
    tempoMedioEsperaTransporteMin: 18,
    satisfacaoTransportePublico: 3.8,
    modalShare: {
      transportePublico: 0.26,
      shuttle: 0.33,
      aplicativo: 0.18,
      aluguel: 0.17,
      micromobilidade: 0.06,
      transporteProprio: 0.24
    },

    ocorrenciasPor100k: 110,

    projetosInovacaoAno: 3,
    mauAppTurismo: 766,

    eventosCriativosAno: 8,

    engajamentoDigitalPct: 0.14
  },
  Negócios: {
    turistas: 21500,
    avaliacaoMedia: 4.2,
    negocios: 77,
    ocupacaoHoteis: 0.69,
    permanenciaMediaDias: 5.9,
    gastoMedioBRL: 880,

    qualidadeVidaIndice: 73,
    acessibilidadeIndice: 80,
    conectividadeIndice: 90,

    aguaLitrosPorVisitante: 180,
    energiaKwhPorVisitante: 7.0,
    residuosKgPorVisitante: 1.4,

    tempoMedioDeslocamentoMin: 20,
    transportePublicoCoberturaPct: 0.78,
    tempoMedioEsperaTransporteMin: 12,
    satisfacaoTransportePublico: 4.3,
    modalShare: {
      transportePublico: 0.41,
      shuttle: 0.17,
      aplicativo: 0.27,
      aluguel: 0.11,
      micromobilidade: 0.04,
      transporteProprio: 0.16
    },

    ocorrenciasPor100k: 170,

    projetosInovacaoAno: 8,
    mauAppTurismo: 965,

    eventosCriativosAno: 18,

    engajamentoDigitalPct: 0.31
  },
  Cultural: {
    turistas: 15300,
    avaliacaoMedia: 4.6,
    negocios: 63,
    ocupacaoHoteis: 0.76,
    permanenciaMediaDias: 6.5,
    gastoMedioBRL: 640,

    qualidadeVidaIndice: 79,
    acessibilidadeIndice: 74,
    conectividadeIndice: 79,

    aguaLitrosPorVisitante: 205,
    energiaKwhPorVisitante: 8.4,
    residuosKgPorVisitante: 1.2,

    tempoMedioDeslocamentoMin: 26,
    transportePublicoCoberturaPct: 0.75,
    tempoMedioEsperaTransporteMin: 13,
    satisfacaoTransportePublico: 4.1,
    modalShare: {
      transportePublico: 0.44,
      shuttle: 0.16,
      aplicativo: 0.24,
      aluguel: 0.1,
      micromobilidade: 0.06,
      transporteProprio: 0.15
    },

    ocorrenciasPor100k: 130,

    projetosInovacaoAno: 6,
    mauAppTurismo: 416,

    eventosCriativosAno: 42,

    engajamentoDigitalPct: 0.24
  }
};

const MONTH_ORDER = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];

const touristsByMonth: TouristMonthData[] = [
  { mes: "Jan", ano: 2024, Ecoturismo: 900, Aventura: 700, Urbano: 2500, Gastronomia: 430, Agroturismo: 320, Negócios: 1800, Cultural: 1200 },
  { mes: "Fev", ano: 2024, Ecoturismo: 1100, Aventura: 820, Urbano: 2600, Gastronomia: 500, Agroturismo: 360, Negócios: 1950, Cultural: 1300 },
  { mes: "Mar", ano: 2024, Ecoturismo: 1300, Aventura: 900, Urbano: 2700, Gastronomia: 530, Agroturismo: 380, Negócios: 2050, Cultural: 1400 },
  { mes: "Abr", ano: 2024, Ecoturismo: 1150, Aventura: 860, Urbano: 2450, Gastronomia: 480, Agroturismo: 350, Negócios: 1900, Cultural: 1350 },
  { mes: "Mai", ano: 2024, Ecoturismo: 1400, Aventura: 950, Urbano: 2800, Gastronomia: 600, Agroturismo: 410, Negócios: 2100, Cultural: 1500 },
  { mes: "Jun", ano: 2024, Ecoturismo: 1550, Aventura: 980, Urbano: 2900, Gastronomia: 620, Agroturismo: 430, Negócios: 2250, Cultural: 1600 },
  { mes: "Jan", ano: 2025, Ecoturismo: 980, Aventura: 730, Urbano: 2600, Gastronomia: 460, Agroturismo: 340, Negócios: 1850, Cultural: 1250 },
  { mes: "Fev", ano: 2025, Ecoturismo: 1180, Aventura: 860, Urbano: 2700, Gastronomia: 520, Agroturismo: 370, Negócios: 2050, Cultural: 1360 },
  { mes: "Mar", ano: 2025, Ecoturismo: 1370, Aventura: 950, Urbano: 2820, Gastronomia: 560, Agroturismo: 400, Negócios: 2150, Cultural: 1450 },
  { mes: "Abr", ano: 2025, Ecoturismo: 1200, Aventura: 910, Urbano: 2520, Gastronomia: 500, Agroturismo: 360, Negócios: 1980, Cultural: 1390 },
  { mes: "Mai", ano: 2025, Ecoturismo: 1460, Aventura: 1000, Urbano: 2920, Gastronomia: 630, Agroturismo: 420, Negócios: 2180, Cultural: 1550 },
  { mes: "Jun", ano: 2025, Ecoturismo: 1600, Aventura: 1020, Urbano: 3050, Gastronomia: 650, Agroturismo: 450, Negócios: 2320, Cultural: 1650 }
];

/**
 * Radar agora representa maturidade por eixo DTI (0-5).
 */
const maturityByCategory: Record<BaseTourismCategory, RadarPoint[]> = {
  Ecoturismo: [
    { eixo: "Governança", valor: 4.0 },
    { eixo: "Inovação", valor: 3.8 },
    { eixo: "Tecnologia", valor: 3.9 },
    { eixo: "Acessibilidade", valor: 3.6 },
    { eixo: "Sustentabilidade", valor: 4.7 },
    { eixo: "Criatividade", valor: 4.1 },
    { eixo: "Mobilidade", valor: 3.7 },
    { eixo: "Marketing", valor: 3.9 },
    { eixo: "Segurança", valor: 4.2 }
  ],
  Aventura: [
    { eixo: "Governança", valor: 3.8 },
    { eixo: "Inovação", valor: 3.6 },
    { eixo: "Tecnologia", valor: 3.7 },
    { eixo: "Acessibilidade", valor: 3.3 },
    { eixo: "Sustentabilidade", valor: 4.0 },
    { eixo: "Criatividade", valor: 3.5 },
    { eixo: "Mobilidade", valor: 3.6 },
    { eixo: "Marketing", valor: 3.7 },
    { eixo: "Segurança", valor: 4.3 }
  ],
  Urbano: [
    { eixo: "Governança", valor: 4.2 },
    { eixo: "Inovação", valor: 4.1 },
    { eixo: "Tecnologia", valor: 4.6 },
    { eixo: "Acessibilidade", valor: 4.4 },
    { eixo: "Sustentabilidade", valor: 3.7 },
    { eixo: "Criatividade", valor: 4.2 },
    { eixo: "Mobilidade", valor: 4.0 },
    { eixo: "Marketing", valor: 4.3 },
    { eixo: "Segurança", valor: 3.9 }
  ],
  Gastronomia: [
    { eixo: "Governança", valor: 3.9 },
    { eixo: "Inovação", valor: 3.7 },
    { eixo: "Tecnologia", valor: 3.6 },
    { eixo: "Acessibilidade", valor: 3.8 },
    { eixo: "Sustentabilidade", valor: 4.1 },
    { eixo: "Criatividade", valor: 4.0 },
    { eixo: "Mobilidade", valor: 3.5 },
    { eixo: "Marketing", valor: 3.8 },
    { eixo: "Segurança", valor: 4.1 }
  ],
  Agroturismo: [
    { eixo: "Governança", valor: 3.6 },
    { eixo: "Inovação", valor: 3.2 },
    { eixo: "Tecnologia", valor: 3.1 },
    { eixo: "Acessibilidade", valor: 3.0 },
    { eixo: "Sustentabilidade", valor: 4.2 },
    { eixo: "Criatividade", valor: 3.6 },
    { eixo: "Mobilidade", valor: 3.2 },
    { eixo: "Marketing", valor: 3.3 },
    { eixo: "Segurança", valor: 4.0 }
  ],
  Negócios: [
    { eixo: "Governança", valor: 4.1 },
    { eixo: "Inovação", valor: 4.0 },
    { eixo: "Tecnologia", valor: 4.5 },
    { eixo: "Acessibilidade", valor: 4.3 },
    { eixo: "Sustentabilidade", valor: 3.5 },
    { eixo: "Criatividade", valor: 3.8 },
    { eixo: "Mobilidade", valor: 4.2 },
    { eixo: "Marketing", valor: 4.6 },
    { eixo: "Segurança", valor: 3.8 }
  ],
  Cultural: [
    { eixo: "Governança", valor: 4.0 },
    { eixo: "Inovação", valor: 3.9 },
    { eixo: "Tecnologia", valor: 4.0 },
    { eixo: "Acessibilidade", valor: 3.7 },
    { eixo: "Sustentabilidade", valor: 3.9 },
    { eixo: "Criatividade", valor: 4.8 },
    { eixo: "Mobilidade", valor: 3.8 },
    { eixo: "Marketing", valor: 4.0 },
    { eixo: "Segurança", valor: 4.1 }
  ]
};

type RawBusiness = Omit<Business, "categoria"> & { categoria: string };

const negocios: Business[] = (negociosData as RawBusiness[]).map((negocio) => ({
  ...negocio,
  categoria: normalizeCategoryName(negocio.categoria)
}));

type MapMarker = {
  label: string;
  descricao: string;
  lat: number;
  lng: number;
  color: string;
  category: TourismCategory;
};

type AttractionRecord = {
  nome: string;
  descricao_breve: string;
  latitude: number;
  longitude: number;
  categoria?: string;
};

const MAP_MARKERS: MapMarker[] = (attractionsData as AttractionRecord[]).map((attraction) => {
  const rawCategory = attraction.categoria ?? ATTRACTION_CATEGORY_MAP[attraction.nome] ?? "Ecoturismo";
  const category = normalizeCategoryName(rawCategory);
  return {
    label: attraction.nome,
    descricao: attraction.descricao_breve,
    lat: attraction.latitude,
    lng: attraction.longitude,
    color: CATEGORY_COLOR_MAP[category],
    category
  };
});

// --------------------
// Funções de agregação
// --------------------
function aggregateMetrics(categories: BaseTourismCategory[]): CategoryMetrics {
  if (categories.length === 0) {
    // fallback seguro
    return {
      turistas: 0,
      avaliacaoMedia: 0,
      negocios: 0,
      ocupacaoHoteis: 0,
      permanenciaMediaDias: 0,
      gastoMedioBRL: 0,

      qualidadeVidaIndice: 0,
      acessibilidadeIndice: 0,
      conectividadeIndice: 0,

      aguaLitrosPorVisitante: 0,
      energiaKwhPorVisitante: 0,
      residuosKgPorVisitante: 0,

      tempoMedioDeslocamentoMin: 0,
      transportePublicoCoberturaPct: 0,
      tempoMedioEsperaTransporteMin: 0,
      satisfacaoTransportePublico: 0,
      modalShare: {
        transportePublico: 0,
        shuttle: 0,
        aplicativo: 0,
        aluguel: 0,
        micromobilidade: 0,
        transporteProprio: 0,
      },

      ocorrenciasPor100k: 0,

      projetosInovacaoAno: 0,
      mauAppTurismo: 0,

      eventosCriativosAno: 0,

      engajamentoDigitalPct: 0
    };
  }

  const sums = categories.reduce(
    (acc, c) => {
      const m = metricsByCategory[c];
      acc.turistas += m.turistas;
      acc.negocios += m.negocios;
      acc.projetosInovacaoAno += m.projetosInovacaoAno;
      acc.eventosCriativosAno += m.eventosCriativosAno;
      // MAU em "Todos" aqui é apenas soma fictícia por categoria
      acc.mauAppTurismo += m.mauAppTurismo;
      return acc;
    },
    {
      turistas: 0,
      negocios: 0,
      projetosInovacaoAno: 0,
      eventosCriativosAno: 0,
      mauAppTurismo: 0
    }
  );

  const avg = (getter: (m: CategoryMetrics) => number) =>
    categories.reduce((s, c) => s + getter(metricsByCategory[c]), 0) /
    categories.length;

  return {
    turistas: sums.turistas,
    negocios: sums.negocios,
    projetosInovacaoAno: sums.projetosInovacaoAno,
    eventosCriativosAno: sums.eventosCriativosAno,
    mauAppTurismo: sums.mauAppTurismo,

    avaliacaoMedia: avg((m) => m.avaliacaoMedia),
    ocupacaoHoteis: avg((m) => m.ocupacaoHoteis),
    permanenciaMediaDias: avg((m) => m.permanenciaMediaDias),
    gastoMedioBRL: avg((m) => m.gastoMedioBRL),

    qualidadeVidaIndice: avg((m) => m.qualidadeVidaIndice),
    acessibilidadeIndice: avg((m) => m.acessibilidadeIndice),
    conectividadeIndice: avg((m) => m.conectividadeIndice),

    aguaLitrosPorVisitante: avg((m) => m.aguaLitrosPorVisitante),
    energiaKwhPorVisitante: avg((m) => m.energiaKwhPorVisitante),
    residuosKgPorVisitante: avg((m) => m.residuosKgPorVisitante),

    tempoMedioDeslocamentoMin: avg((m) => m.tempoMedioDeslocamentoMin),
    transportePublicoCoberturaPct: avg((m) => m.transportePublicoCoberturaPct),
    tempoMedioEsperaTransporteMin: avg((m) => m.tempoMedioEsperaTransporteMin),
    satisfacaoTransportePublico: avg((m) => m.satisfacaoTransportePublico),
    modalShare: {
      transportePublico: avg((m) => m.modalShare.transportePublico),
      shuttle: avg((m) => m.modalShare.shuttle),
      aplicativo: avg((m) => m.modalShare.aplicativo),
      aluguel: avg((m) => m.modalShare.aluguel),
      micromobilidade: avg((m) => m.modalShare.micromobilidade),
      transporteProprio: avg((m) => m.modalShare.transporteProprio)
    },

    ocorrenciasPor100k: avg((m) => m.ocorrenciasPor100k),

    engajamentoDigitalPct: avg((m) => m.engajamentoDigitalPct)
  };
}

function aggregateRadar(categories: BaseTourismCategory[]): RadarPoint[] {
  if (categories.length === 0) return [];
  const eixos = maturityByCategory[categories[0]].map((p) => p.eixo);

  return eixos.map((eixo) => {
    const media =
      categories.reduce((sum, category) => {
        const ponto = maturityByCategory[category].find((p) => p.eixo === eixo);
        return sum + (ponto?.valor ?? 0);
      }, 0) / categories.length;
    return { eixo, valor: media };
  });
}


// --------------------
// Dashboard
// --------------------
function DtiDashboard() {
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<CategoryId>("Todos");
  const [mesSelecionado, setMesSelecionado] = useState<string>("Todos");
  const [anoSelecionado, setAnoSelecionado] = useState<number | "Todos">("Todos");
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroCategoriaTabela, setFiltroCategoriaTabela] = useState<CategoryId>("Todos");
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  const [filtroAcessivel, setFiltroAcessivel] = useState<"Todos" | "Sim" | "Não">("Todos");
  const [filtroSituacao, setFiltroSituacao] = useState("Todos");
  const [filtroAvaliacaoMin, setFiltroAvaliacaoMin] = useState<number | "Todos">("Todos");
  const [sortConfig, setSortConfig] = useState<{ column: SortableColumn; direction: "asc" | "desc" }>({
    column: "nome",
    direction: "asc"
  });
  const handleSort = (column: SortableColumn) => {
    setSortConfig((prev) => {
      if (prev.column === column) {
        return { column, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { column, direction: "asc" };
    });
  };

  const renderSortIcon = (column: SortableColumn) => {
    if (sortConfig.column !== column) return null;
    return <span style={{ marginLeft: 6 }}>{sortConfig.direction === "asc" ? "▲" : "▼"}</span>;
  };

  const anosDisponiveis = useMemo(
    () => Array.from(new Set(touristsByMonth.map((item) => item.ano))).sort((a, b) => a - b),
    []
  );
  const mesesDisponiveis = useMemo(() => {
    const unique = new Set(touristsByMonth.map((item) => item.mes));
    return MONTH_ORDER.filter((mes) => unique.has(mes));
  }, []);

  const limparPeriodo = () => {
    setMesSelecionado("Todos");
    setAnoSelecionado("Todos");
  };

  const anoSelecionadoValor = anoSelecionado === "Todos" ? "Todos" : String(anoSelecionado);

  const metrics = useMemo<CategoryMetrics>(() => {
    if (categoriaSelecionada === "Todos") {
      return aggregateMetrics(BASE_CATEGORIES);
    }
    const baseCategory = CATEGORY_BASE_MAP[categoriaSelecionada];
    return metricsByCategory[baseCategory];
  }, [categoriaSelecionada]);

  const filteredTouristSeries = useMemo(() => {
    const filtered = touristsByMonth.filter(
      (item) =>
        (mesSelecionado === "Todos" || item.mes === mesSelecionado) &&
        (anoSelecionado === "Todos" || item.ano === anoSelecionado)
    );
    return filtered.length > 0 ? filtered : touristsByMonth;
  }, [mesSelecionado, anoSelecionado]);

  const lineData = useMemo<LineDataPoint[]>(() => {
    const dataset = filteredTouristSeries;
    if (categoriaSelecionada === "Todos") {
      return dataset.map((item) => {
        const soma = BASE_CATEGORIES.reduce((sum, category) => sum + item[category], 0);
        return { mes: `${item.mes}/${item.ano}`, Turistas: soma };
      });
    }

    const baseCategory = CATEGORY_BASE_MAP[categoriaSelecionada];
    return dataset.map((item) => ({
      mes: `${item.mes}/${item.ano}`,
      Turistas: item[baseCategory]
    }));
  }, [filteredTouristSeries, categoriaSelecionada]);

  const lineChartData = useMemo<ChartData<"line">>(() => {
    return {
      labels: lineData.map((item) => item.mes),
      datasets: [
        {
          label: "Turistas",
          data: lineData.map((item) => item.Turistas),
          borderColor: "#2563eb",
          backgroundColor: "rgba(37, 99, 235, 0.15)",
          borderWidth: 2,
          fill: true,
          tension: 0.35
        }
      ]
    };
  }, [lineData]);

  const radarBaseData = useMemo<RadarPoint[]>(() => {
    if (categoriaSelecionada === "Todos") {
      return aggregateRadar(BASE_CATEGORIES);
    }
    const baseCategory = CATEGORY_BASE_MAP[categoriaSelecionada];
    return maturityByCategory[baseCategory];
  }, [categoriaSelecionada]);

  const radarPercentData = useMemo(() => {
    return radarBaseData.map((point) => ({
      ...point,
      valor: Number((point.valor * 20).toFixed(1))
    }));
  }, [radarBaseData]);

  const radarChartData = useMemo<ChartData<"radar">>(() => {
    return {
      labels: radarPercentData.map((point) => point.eixo),
      datasets: [
        {
          label: "Maturidade DTI (%)",
          data: radarPercentData.map((point) => point.valor),
          borderColor: "#2563eb",
          backgroundColor: "rgba(37, 99, 235, 0.2)",
          pointBackgroundColor: "#2563eb",
          pointBorderColor: "#fff",
          borderWidth: 2,
          fill: true
        }
      ]
    };
  }, [radarPercentData]);

  const tiposDisponiveis = useMemo(() => {
    return Array.from(new Set(negocios.map((negocio) => negocio.tipo))).sort((a, b) =>
      a.localeCompare(b, "pt-BR")
    );
  }, []);

  const situacoesDisponiveis = useMemo(() => {
    return Array.from(new Set(negocios.map((negocio) => negocio.situacaoCadastral))).sort((a, b) =>
      a.localeCompare(b, "pt-BR")
    );
  }, []);

  const negociosFiltrados = useMemo<Business[]>(() => {
    const nomeFiltroNormalizado = filtroNome.trim().toLowerCase();
    const avaliacaoMin = filtroAvaliacaoMin === "Todos" ? null : filtroAvaliacaoMin;

    return negocios.filter((negocio) => {
      if (categoriaSelecionada !== "Todos" && negocio.categoria !== categoriaSelecionada) return false;
      if (filtroCategoriaTabela !== "Todos" && negocio.categoria !== filtroCategoriaTabela) return false;
      if (filtroTipo !== "Todos" && negocio.tipo !== filtroTipo) return false;
      if (filtroSituacao !== "Todos" && negocio.situacaoCadastral !== filtroSituacao) return false;
      if (filtroAcessivel !== "Todos" && negocio.acessivel !== (filtroAcessivel === "Sim")) return false;
      if (avaliacaoMin !== null && negocio.avaliacao < avaliacaoMin) return false;
      if (nomeFiltroNormalizado && !negocio.nome.toLowerCase().includes(nomeFiltroNormalizado)) return false;
      return true;
    });
  }, [categoriaSelecionada, filtroCategoriaTabela, filtroTipo, filtroSituacao, filtroAcessivel, filtroNome, filtroAvaliacaoMin]);

  const negociosOrdenados = useMemo(() => {
    const data = [...negociosFiltrados];
    const getValue = (negocio: Business, column: SortableColumn) => {
      switch (column) {
        case "nome":
          return negocio.nome;
        case "categoria":
          return negocio.categoria;
        case "avaliacao":
          return negocio.avaliacao;
        case "tipo":
          return negocio.tipo;
        case "acessivel":
          return negocio.acessivel ? 1 : 0;
        case "situacaoCadastral":
          return negocio.situacaoCadastral;
        default:
          return "";
      }
    };

    data.sort((a, b) => {
      const valueA = getValue(a, sortConfig.column);
      const valueB = getValue(b, sortConfig.column);

      let comparison = 0;
      if (typeof valueA === "number" && typeof valueB === "number") {
        comparison = valueA - valueB;
      } else {
        comparison = String(valueA).localeCompare(String(valueB), "pt-BR", { sensitivity: "base" });
      }

      return sortConfig.direction === "asc" ? comparison : -comparison;
    });

    return data;
  }, [negociosFiltrados, sortConfig]);

  const totalTuristasPeriodo = useMemo(
    () => lineData.reduce((sum, item) => sum + item.Turistas, 0),
    [lineData]
  );

  const operationalSections = [
    {
      titulo: "Inovação e tecnologia",
      subtitulo: "Projetos estruturantes, soluções digitais e relacionamento em canais oficiais.",
      cards: [
        {
          titulo: "Inovação (projetos/ano)",
          valor: metrics.projetosInovacaoAno.toLocaleString("pt-BR"),
          icon: <FaLightbulb />
        },
        {
          titulo: "Tecnologia (usuários app)",
          valor: metrics.mauAppTurismo.toLocaleString("pt-BR"),
          sufixo: "MAU"
        },
        {
          titulo: "Engajamento digital",
          valor: (metrics.engajamentoDigitalPct * 100).toFixed(0),
          sufixo: "%",
          icon: <FaBullhorn />
        }
      ]
    },
    {
      titulo: "Sustentabilidade ambiental",
      subtitulo: "Consumo médio por visitante considerando ações de ecoeficiência.",
      cards: [
        {
          titulo: "Água",
          valor: metrics.aguaLitrosPorVisitante.toFixed(0),
          sufixo: "L/visit./dia",
          icon: <FaWater />
        },
        {
          titulo: "Energia",
          valor: metrics.energiaKwhPorVisitante.toFixed(1),
          sufixo: "kWh/visit./dia",
          icon: <FaBolt />
        },
        {
          titulo: "Resíduos",
          valor: metrics.residuosKgPorVisitante.toFixed(1),
          sufixo: "kg/visit./dia"
        }
      ]
    },
    {
      titulo: "Mobilidade e segurança",
      subtitulo: "Tempo de deslocamento, sensação de segurança e oferta cultural.",
      cards: [
        {
          titulo: "Mobilidade (tempo médio)",
          valor: metrics.tempoMedioDeslocamentoMin.toFixed(0),
          sufixo: "min",
          icon: <FaRoute />
        },
        {
          titulo: "Segurança (ocorrências)",
          valor: metrics.ocorrenciasPor100k.toFixed(0),
          sufixo: "/100k turistas",
          icon: <FaShieldAlt />
        },
        {
          titulo: "Criatividade (eventos/ano)",
          valor: metrics.eventosCriativosAno.toLocaleString("pt-BR")
        }
      ]
    }
  ];

  return (
    <div
      style={{
        padding: "24px",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        backgroundColor: "#0f172a",
        color: "#e2e8f0",
        minHeight: "100vh"
      }}
    >
      <h1 style={{ marginBottom: "8px", color: "#f8fafc" }}>Painel DTI - Barra de São Miguel</h1>
      <p style={{ marginBottom: "24px", color: "#94a3b8" }}>
        Tipo de Turismo
      </p>

      {/* Filtros de categoria */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoriaSelecionada(cat.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 12px",
              borderRadius: "999px",
              border: categoriaSelecionada === cat.id ? "1px solid #60a5fa" : "1px solid #334155",
              backgroundColor: categoriaSelecionada === cat.id ? "#1d4ed8" : "#1e293b",
              color: categoriaSelecionada === cat.id ? "#f8fafc" : "#cbd5f5",
              cursor: "pointer",
              fontSize: "0.9rem",
              boxShadow: "0 4px 12px rgba(2,6,23,0.4)"
            }}
          >
            {cat.icon && <span>{cat.icon}</span>}
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Filtro de período */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Mês</label>
          <select
            value={mesSelecionado}
            onChange={(event) => setMesSelecionado(event.target.value)}
            style={{
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              color: "#f8fafc",
              borderRadius: "8px",
              padding: "8px"
            }}
          >
            <option value="Todos">Todos os meses</option>
            {mesesDisponiveis.map((mes) => (
              <option key={mes} value={mes}>
                {mes}
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Ano</label>
          <select
            value={anoSelecionadoValor}
            onChange={(event) => {
              const value = event.target.value;
              setAnoSelecionado(value === "Todos" ? "Todos" : Number(value));
            }}
            style={{
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              color: "#f8fafc",
              borderRadius: "8px",
              padding: "8px"
            }}
          >
            <option value="Todos">Todos os anos</option>
            {anosDisponiveis.map((ano) => (
              <option key={ano} value={ano}>
                {ano}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={limparPeriodo}
          style={{
            alignSelf: "flex-end",
            padding: "8px 12px",
            borderRadius: "8px",
            border: "1px solid #334155",
            backgroundColor: "#0f172a",
            color: "#f8fafc",
            cursor: "pointer",
            height: "38px"
          }}
        >
          Limpar período
        </button>
      </div>

      {/* KPIs principais de Demanda/Experiência */}
      <SectionTitle titulo="Demanda e experiência" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "16px", marginBottom: "20px" }}>
        <KpiCard titulo="Turistas no período" valor={totalTuristasPeriodo.toLocaleString("pt-BR")} />
        <KpiCard
          titulo="Avaliação média"
          valor={metrics.avaliacaoMedia.toFixed(1)}
          sufixo={
            <>
              /5 <FaRegStar color="#fbbf24" size={14} />
            </>
          }
        />
        {/* <KpiCard titulo="Negócios cadastrados" valor={metrics.negocios.toLocaleString("pt-BR")} /> */}
        <KpiCard titulo="Ocupação hoteleira" valor={(metrics.ocupacaoHoteis * 100).toFixed(0)} sufixo="%" />
        <KpiCard titulo="Permanência média" valor={metrics.permanenciaMediaDias.toFixed(1)} sufixo="dias" />
        <KpiCard titulo="Gasto médio por turista" valor={metrics.gastoMedioBRL.toLocaleString("pt-BR")} sufixo="R$/dia" />
      </div>

      {/* KPIs mínimos do DTI */}
      <SectionTitle titulo="KPIs mínimos do DTI" subtitulo="Qualidade de vida, acessibilidade e conectividade são indicadores-chave exigidos pelo modelo." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <KpiCard
          titulo="Qualidade de vida (índice)"
          valor={metrics.qualidadeVidaIndice.toFixed(0)}
          sufixo="/100"
          icon={<FaHeartbeat />}
        />
        <KpiCard
          titulo="Acessibilidade universal (índice)"
          valor={metrics.acessibilidadeIndice.toFixed(0)}
          sufixo="/100"
          icon={<FaUniversalAccess />}
        />
        <KpiCard
          titulo="Conectividade (índice)"
          valor={metrics.conectividadeIndice.toFixed(0)}
          sufixo="/100"
          icon={<FaWifi />}
        />
      </div>

      {/* Transporte público */}
      <SectionTitle titulo="Transporte público e mobilidade turística" subtitulo="Cobertura, tempo de espera e percepção de qualidade segundo o filtro ativo." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "20px" }}>
        <TransportIndicatorCard
          label="Cobertura do transporte público"
          value={`${(metrics.transportePublicoCoberturaPct * 100).toFixed(0)}%`}
          description="Trechos da zona turística atendidos por linhas regulares."
        />
        <TransportIndicatorCard
          label="Tempo médio de espera"
          value={`${metrics.tempoMedioEsperaTransporteMin.toFixed(0)} min`}
          description="Intervalo médio em pontos estratégicos."
        />
        <TransportIndicatorCard
          label="Satisfação com transporte"
          value={`${metrics.satisfacaoTransportePublico.toFixed(1)}/5`}
          description="Pesquisa com visitantes e moradores."
        />
      </div>
      <div style={{ backgroundColor: "#1f2937", borderRadius: "16px", padding: "16px", boxShadow: "0 15px 35px rgba(2,6,23,0.35)", marginBottom: "24px" }}>
        <h3 style={{ margin: "0 0 8px", fontSize: "1rem", color: "#f1f5f9" }}>Modais mais utilizados pelos turistas</h3>
        <p style={{ margin: "0 0 16px", fontSize: "0.85rem", color: "#94a3b8" }}>
          Distribuição percentual estimada a partir de pesquisas de origem/destino.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {(Object.keys(MODAL_LABELS) as (keyof ModalShare)[]).map((modalKey) => (
            <ModalShareBar key={modalKey} label={MODAL_LABELS[modalKey]} value={metrics.modalShare[modalKey]} />
          ))}
        </div>
      </div>

      {operationalSections.map((section) => (
        <div key={section.titulo} style={{ marginBottom: "24px" }}>
          <SectionTitle titulo={section.titulo} subtitulo={section.subtitulo} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "16px" }}>
            {section.cards.map((card) => (
              <KpiCard
                key={card.titulo}
                titulo={card.titulo}
                valor={card.valor}
                sufixo={card.sufixo}
                icon={card.icon}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Gráfico de linha e radar */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1.5fr)", gap: "24px", marginBottom: "24px" }}>
        <div style={{ backgroundColor: "#1f2937", borderRadius: "16px", padding: "16px", boxShadow: "0 15px 35px rgba(2,6,23,0.35)" }}>
          <h2 style={{ fontSize: "1rem", marginBottom: "8px", color: "#f1f5f9" }}>Fluxo de turistas por mês</h2>
          <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "16px" }}>
            Valores agregados conforme o filtro de categoria.
          </p>
          <div style={{ width: "100%", height: 260 }}>
            <LineChart data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        <div style={{ backgroundColor: "#1f2937", borderRadius: "16px", padding: "16px", boxShadow: "0 15px 35px rgba(2,6,23,0.35)" }}>
          <h2 style={{ fontSize: "1rem", marginBottom: "8px", color: "#f1f5f9" }}>Maturidade por eixo DTI</h2>
          <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "16px" }}>
            Governança, inovação, tecnologia, acessibilidade, sustentabilidade, criatividade, mobilidade, marketing e segurança (escala percentual 0-100%).
          </p>
          <div style={{ width: "100%", height: 260 }}>
            {radarChartData.labels?.length ? (
              <RadarChart data={radarChartData} options={radarChartOptions} />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}>
                Sem dados suficientes para o radar.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mapa mockado */}
      <div style={{ backgroundColor: "#1f2937", borderRadius: "16px", padding: "16px", boxShadow: "0 15px 35px rgba(2,6,23,0.35)", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "1rem", marginBottom: "8px", color: "#f1f5f9" }}>Mapa de atrativos</h2>
        <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "12px" }}>
          Ícones representam o tipo de turismo vinculado a cada atrativo.
        </p>
        <InteractiveMap markers={MAP_MARKERS} />
      </div>

      {/* Tabela de negócios */}
      <div style={{ backgroundColor: "#1f2937", borderRadius: "16px", padding: "16px", boxShadow: "0 15px 35px rgba(2,6,23,0.35)" }}>
        <h2 style={{ fontSize: "1rem", marginBottom: "8px", color: "#f1f5f9" }}>Negócios cadastrados</h2>
        <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "12px" }}>
          Lista filtrada pela categoria selecionada.
        </p>
        <div
          style={{
            borderRadius: "12px",
            border: "1px solid rgba(148,163,184,0.2)",
            overflow: "visible",
            position: "relative",
            zIndex: 0
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead>
                <tr>
                  <Th onClick={() => handleSort("nome")} style={{ cursor: "pointer" }}>
                    Nome {renderSortIcon("nome")}
                  </Th>
                  <Th onClick={() => handleSort("categoria")} style={{ cursor: "pointer" }}>
                    Categoria {renderSortIcon("categoria")}
                  </Th>
                  <Th onClick={() => handleSort("avaliacao")} style={{ cursor: "pointer" }}>
                    Avaliação {renderSortIcon("avaliacao")}
                  </Th>
                  <Th onClick={() => handleSort("tipo")} style={{ cursor: "pointer" }}>
                    Tipo {renderSortIcon("tipo")}
                  </Th>
                  <Th onClick={() => handleSort("acessivel")} style={{ cursor: "pointer" }}>
                    Acessível {renderSortIcon("acessivel")}
                  </Th>
                  <Th onClick={() => handleSort("situacaoCadastral")} style={{ cursor: "pointer" }}>
                    Situação cadastral {renderSortIcon("situacaoCadastral")}
                  </Th>
                </tr>
                <tr>
                  <Th style={{ backgroundColor: "#111a2c" }}>
                    <input
                      value={filtroNome}
                      onChange={(event) => setFiltroNome(event.target.value)}
                      placeholder="Buscar nome"
                      style={{
                        width: "100%",
                        backgroundColor: "#0f172a",
                        border: "1px solid #334155",
                        color: "#f8fafc",
                        borderRadius: "6px",
                        padding: "6px 8px",
                        fontSize: "0.8rem"
                      }}
                    />
                  </Th>
                  <Th style={{ backgroundColor: "#111a2c" }}>
                    <select
                      value={filtroCategoriaTabela}
                      onChange={(event) => setFiltroCategoriaTabela(event.target.value as CategoryId)}
                      style={{
                        width: "100%",
                        backgroundColor: "#0f172a",
                        border: "1px solid #334155",
                        color: "#f8fafc",
                        borderRadius: "6px",
                        padding: "6px 8px"
                      }}
                    >
                      <option value="Todos">Todas as categorias</option>
                      {TOURISM_CATEGORIES.map((categoria) => (
                        <option key={categoria} value={categoria}>
                          {categoria}
                        </option>
                      ))}
                    </select>
                  </Th>
                  <Th style={{ backgroundColor: "#111a2c" }}>
                    <select
                      value={filtroAvaliacaoMin}
                      onChange={(event) => {
                        const value = event.target.value;
                        setFiltroAvaliacaoMin(value === "Todos" ? "Todos" : Number(value));
                      }}
                      style={{
                        width: "100%",
                        backgroundColor: "#0f172a",
                        border: "1px solid #334155",
                        color: "#f8fafc",
                        borderRadius: "6px",
                        padding: "6px 8px"
                      }}
                    >
                      <option value="Todos">Todas as notas</option>
                      {[1, 2, 3, 4, 5].map((nota) => (
                        <option key={nota} value={nota}>
                          {`${nota} ${nota === 1 ? "★" : "★"}`}
                        </option>
                      ))}
                    </select>
                  </Th>
                  <Th style={{ backgroundColor: "#111a2c" }}>
                    <select
                      value={filtroTipo}
                      onChange={(event) => setFiltroTipo(event.target.value)}
                      style={{
                        width: "100%",
                        backgroundColor: "#0f172a",
                        border: "1px solid #334155",
                        color: "#f8fafc",
                        borderRadius: "6px",
                        padding: "6px 8px"
                      }}
                    >
                      <option value="Todos">Todos os tipos</option>
                      {tiposDisponiveis.map((tipo) => (
                        <option key={tipo} value={tipo}>
                          {tipo}
                        </option>
                      ))}
                    </select>
                  </Th>
                  <Th style={{ backgroundColor: "#111a2c" }}>
                    <select
                      value={filtroAcessivel}
                      onChange={(event) => setFiltroAcessivel(event.target.value as "Todos" | "Sim" | "Não")}
                      style={{
                        width: "100%",
                        backgroundColor: "#0f172a",
                        border: "1px solid #334155",
                        color: "#f8fafc",
                        borderRadius: "6px",
                        padding: "6px 8px"
                      }}
                    >
                      <option value="Todos">Todos</option>
                      <option value="Sim">Sim</option>
                      <option value="Não">Não</option>
                    </select>
                  </Th>
                  <Th style={{ backgroundColor: "#111a2c" }}>
                    <select
                      value={filtroSituacao}
                      onChange={(event) => setFiltroSituacao(event.target.value)}
                      style={{
                        width: "100%",
                        backgroundColor: "#0f172a",
                        border: "1px solid #334155",
                        color: "#f8fafc",
                        borderRadius: "6px",
                        padding: "6px 8px"
                      }}
                    >
                      <option value="Todos">Todas</option>
                      {situacoesDisponiveis.map((situacao) => (
                        <option key={situacao} value={situacao}>
                          {situacao}
                        </option>
                      ))}
                    </select>
                  </Th>
                </tr>
              </thead>
            </table>
          </div>
          <div style={{ maxHeight: "360px", overflowX: "auto", overflowY: "auto", position: "relative", zIndex: 0 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <tbody>
              {negociosOrdenados.map((n) => (
                <tr key={n.nome}>
                  <Td>{n.nome}</Td>
                  <Td>{n.categoria}</Td>
                  <Td>{n.avaliacao.toFixed(1)}</Td>
                    <Td>{n.tipo}</Td>
                    <Td>{n.acessivel ? "Sim" : "Não"}</Td>
                    <Td>
                      <StatusBadge status={n.situacaoCadastral} />
                    </Td>
                  </tr>
                ))}
              {negociosOrdenados.length === 0 && (
                <tr>
                    <Td colSpan={6} style={{ textAlign: "center", padding: "16px", color: "#666" }}>
                      Nenhum negócio encontrado para o filtro atual.
                    </Td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

type InteractiveMapProps = {
  markers: MapMarker[];
};

function InteractiveMap({ markers }: InteractiveMapProps) {
  const center = useMemo(() => {
    if (!markers.length) return { lat: -15.78, lng: -47.9 };
    const lat = markers.reduce((sum, marker) => sum + marker.lat, 0) / markers.length;
    const lng = markers.reduce((sum, marker) => sum + marker.lng, 0) / markers.length;
    return { lat, lng };
  }, [markers]);

  return (
    <div style={{ width: "100%", height: 550, borderRadius: "12px", overflow: "hidden", position: "relative" }}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={11}
        scrollWheelZoom={false}
        style={{ width: "100%", height: "100%" }}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {markers.map((marker) => (
          <Marker
            key={`${marker.label}-${marker.lat}`}
            position={[marker.lat, marker.lng]}
            icon={getCategoryMapIcon(marker.category)}
          >
            <Popup>
              <strong>{marker.label}</strong>
              <br />
              {marker.descricao}
              <br />
              <strong>Categoria:</strong> {marker.category}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <div
        style={{
          position: "absolute",
          right: "16px",
          bottom: "16px",
          backgroundColor: "rgba(255,255,255,0.95)",
          borderRadius: "10px",
          padding: "10px 12px",
          width: "230px",
          boxShadow: "0 4px 12px rgba(15, 23, 42, 0.15)"
        }}
      >
        <div style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: "6px", color: "#111827" }}>Legenda dos atrativos</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {markers.map((marker) => (
            <div key={`${marker.label}-legend`} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem", color: "#1f2937" }}>
              <span
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "999px",
                  border: `2px solid ${CATEGORY_COLOR_MAP[marker.category]}`,
                  backgroundColor: "#fff",
                  color: CATEGORY_COLOR_MAP[marker.category],
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.85rem"
                }}
              >
                {CATEGORY_ICON_MAP[marker.category]}
              </span>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontWeight: 600 }}>{marker.label}</span>
                <span style={{ color: "#4b5563", fontSize: "0.7rem" }}>{marker.category}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --------------------
// Componentes auxiliares
// --------------------

type ThProps = ThHTMLAttributes<HTMLTableCellElement> & {
  children?: ReactNode;
};

type TdProps = TdHTMLAttributes<HTMLTableCellElement> & {
  children?: ReactNode;
};

const STATUS_STYLES: Record<Business["situacaoCadastral"], { bg: string; color: string }> = {
  OK: { bg: "rgba(34,197,94,0.15)", color: "#22c55e" },
  "Pendente Cadastur": { bg: "rgba(250,204,21,0.15)", color: "#facc15" },
  "Pendências CNPJ": { bg: "rgba(248,113,113,0.15)", color: "#f87171" },
  "Em análise": { bg: "rgba(14,165,233,0.15)", color: "#0ea5e9" }
};

function SectionTitle({ titulo, subtitulo }: { titulo: string; subtitulo?: string }) {
  return (
    <div style={{ marginBottom: "10px" }}>
      <h2 style={{ fontSize: "1rem", margin: 0, color: "#f1f5f9" }}>{titulo}</h2>
      {subtitulo && (
        <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginTop: "4px", marginBottom: "0" }}>
          {subtitulo}
        </p>
      )}
    </div>
  );
}

type TransportIndicatorCardProps = {
  label: string;
  value: ReactNode;
  description: string;
};

type ModalShareBarProps = {
  label: string;
  value: number;
};

function TransportIndicatorCard({ label, value, description }: TransportIndicatorCardProps) {
  return (
    <div
      style={{
        backgroundColor: "#1f2937",
        borderRadius: "16px",
        padding: "16px",
        boxShadow: "0 15px 35px rgba(2, 6, 23, 0.35)",
        border: "1px solid rgba(99,102,241,0.2)"
      }}
    >
      <p style={{ margin: 0, fontSize: "0.8rem", color: "#94a3b8" }}>{label}</p>
      <div style={{ fontSize: "1.4rem", fontWeight: 600, color: "#f8fafc", margin: "6px 0" }}>{value}</div>
      <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>{description}</p>
    </div>
  );
}

function ModalShareBar({ label, value }: ModalShareBarProps) {
  const percent = Math.round(value * 100);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#e2e8f0", marginBottom: "4px" }}>
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div style={{ width: "100%", height: "6px", borderRadius: "999px", backgroundColor: "#0f172a" }}>
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            borderRadius: "999px",
            background: "linear-gradient(90deg, #38bdf8, #6366f1)"
          }}
        />
      </div>
    </div>
  );
}

type StatusBadgeProps = {
  status: Business["situacaoCadastral"];
};

function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_STYLES[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2px 8px",
        borderRadius: "999px",
        fontSize: "0.75rem",
        fontWeight: 600,
        backgroundColor: style.bg,
        color: style.color,
        textTransform: "uppercase"
      }}
    >
      {status}
    </span>
  );
}

function Th({ children, style, ...rest }: ThProps) {
  return (
    <th
      {...rest}
      style={{
        textAlign: "center",
        padding: "8px 10px",
        borderBottom: "1px solid rgba(148,163,184,0.25)",
        backgroundColor: "rgba(15,23,42,0.95)",
        fontWeight: 600,
        color: "#e2e8f0",
        position: "sticky",
        top: 0,
        zIndex: 1,
        ...style
      }}
    >
      {children}
    </th>
  );
}

function Td({ children, style, ...rest }: TdProps) {
  return (
    <td
      {...rest}
      style={{
        padding: "8px 10px",
        borderBottom: "1px solid rgba(148,163,184,0.15)",
        color: "#cbd5f5",
        whiteSpace: "nowrap",
        ...style
      }}
    >
      {children}
    </td>
  );
}

export default DtiDashboard;
