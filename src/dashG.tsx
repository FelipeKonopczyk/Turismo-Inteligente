import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { 
  Shield, 
  Leaf, 
  Smartphone, 
  Users, 
  Map, 
  Accessibility, 
  Building2, 
  Activity 
} from 'lucide-react';

// --- 1. REGISTRO DE COMPONENTES DO CHART.JS ---
// Necessário para que o "Tree Shaking" funcione corretamente
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// --- 2. DADOS (MOCKADOS BASEADO NA NBR 17259) ---

// Eixo Sustentabilidade [8.2.6]
const sustainabilityData = {
  labels: ['Resíduos Reciclados', 'Energia Renovável', 'Reuso de Água'],
  datasets: [
    {
      label: 'Atual (%)',
      data: [65, 40, 30],
      backgroundColor: 'rgba(16, 185, 129, 0.8)', // Verde Emerald
      borderColor: 'rgba(16, 185, 129, 1)',
      borderWidth: 1,
    },
    {
      label: 'Meta (%)',
      data: [80, 60, 50],
      backgroundColor: 'rgba(229, 231, 235, 0.8)', // Cinza
      borderColor: 'rgba(209, 213, 219, 1)',
      borderWidth: 1,
    },
  ],
};

// Eixo Segurança [8.2.10]
const securityData = {
  labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
  datasets: [
    {
      label: 'Incidentes Registrados',
      data: [45, 40, 32, 28, 25, 18],
      borderColor: 'rgba(239, 68, 68, 1)', // Vermelho
      backgroundColor: 'rgba(239, 68, 68, 0.2)',
      tension: 0.4, // Curva suave
      fill: true,
    },
  ],
};

// Eixo Mobilidade [8.2.8]
const mobilityData = {
  labels: ['Transporte Limpo', 'Transporte Público', 'Transporte Individual'],
  datasets: [
    {
      data: [35, 45, 20],
      backgroundColor: [
        'rgba(16, 185, 129, 0.8)', // Verde
        'rgba(59, 130, 246, 0.8)', // Azul
        'rgba(239, 68, 68, 0.8)',  // Vermelho
      ],
      borderWidth: 1,
    },
  ],
};

// --- 3. CONFIGURAÇÕES COMUNS DOS GRÁFICOS ---

const commonOptions: ChartOptions<any> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
    },
  },
};

const barOptions: ChartOptions<'bar'> = {
  ...commonOptions,
  indexAxis: 'y' as const, // Transforma em gráfico de barras horizontais
  scales: {
    x: {
      max: 100,
      grid: { display: true },
    },
    y: {
      grid: { display: false },
    }
  },
};

// --- 4. COMPONENTES UI ---

const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-lg shadow p-4 border border-gray-100 ${className}`}>{children}</div>
);

const KPICard = ({ title, value, subtext, icon: Icon, trend }: any) => (
  <Card>
    <div className="flex items-center justify-between mb-2">
      <span className="text-gray-500 text-sm font-medium">{title}</span>
      <Icon className="h-5 w-5 text-blue-600" />
    </div>
    <div className="text-2xl font-bold text-gray-800">{value}</div>
    <div className={`text-xs mt-1 ${trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
      {subtext}
    </div>
  </Card>
);

// --- 5. COMPONENTE PRINCIPAL ---

const DashboardDTIGEMINI = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Monitoramento DTI</h1>
        <p className="text-gray-500">
          Painel de Gestão baseado na ABNT NBR 17259 (Compatível React 19)
        </p>
      </header>

      {/* KPI SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard 
          title="Satisfação Visitante (NPS)" 
          value="+72" 
          subtext="▲ 5% vs mês anterior" 
          icon={Users} 
          trend="up" 
        />
        <KPICard 
          title="Digitalização de Processos" 
          value="85%" 
          subtext="Eixo Governança [8.2.2.2]" 
          icon={Building2} 
          trend="up" 
        />
        <KPICard 
          title="Acessibilidade Universal" 
          value="64%" 
          subtext="Locais adaptados [8.2.5]" 
          icon={Accessibility} 
          trend="up" 
        />
        <KPICard 
          title="Conectividade (5G/Wi-Fi)" 
          value="92%" 
          subtext="Cobertura Área Turística [8.2.4]" 
          icon={Smartphone} 
          trend="up" 
        />
      </div>

      {/* CHART SECTION 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        {/* Gráfico de Sustentabilidade */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Leaf className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold text-gray-700">Indicadores Ambientais</h3>
          </div>
          <div className="h-64 w-full">
            <Bar options={barOptions} data={sustainabilityData} />
          </div>
        </Card>

        {/* Gráfico de Segurança */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-red-600" />
            <h3 className="font-semibold text-gray-700">Segurança Turística (Tendência)</h3>
          </div>
          <div className="h-64 w-full">
            <Line options={commonOptions} data={securityData} />
          </div>
        </Card>
      </div>

      {/* CHART SECTION 2 & TABLE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Mobilidade - Doughnut */}
        <Card className="lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <Map className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-700">Matriz de Mobilidade</h3>
          </div>
          <div className="h-64 w-full flex justify-center">
            <Doughnut options={commonOptions} data={mobilityData} />
          </div>
        </Card>

        {/* Tabela de Inovação */}
        <Card className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold text-gray-700">Status de Projetos de Inovação</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-3">Projeto</th>
                  <th className="px-4 py-3">Eixo</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Conclusão</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">App "Destino Aberto"</td>
                  <td className="px-4 py-3">Tecnologia</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Concluído</span></td>
                  <td className="px-4 py-3">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-green-600 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">Wi-Fi Praças Públicas</td>
                  <td className="px-4 py-3">Conectividade</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">Em andamento</span></td>
                  <td className="px-4 py-3">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">Sensores de Fluxo</td>
                  <td className="px-4 py-3">Gestão de Dados</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">Planejamento</span></td>
                  <td className="px-4 py-3">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: '10%' }}></div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardDTIGEMINI;