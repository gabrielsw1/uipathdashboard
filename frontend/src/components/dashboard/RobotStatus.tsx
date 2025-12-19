import { useMemo } from 'react';
import { useSessionsStats } from '@/hooks/useStats';
import { useFilterStore } from '@/store/filterStore';
import { Card } from '../ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Bot, CheckCircle2, AlertCircle, XCircle, Clock } from 'lucide-react';

const COLORS = {
  Available: '#22c55e',
  Busy: '#3b82f6',
  Disconnected: '#6b7280',
  Unresponsive: '#ef4444',
};

const STATUS_CONFIG = {
  Available: { label: 'Disponível', icon: CheckCircle2, gradient: 'from-green-500 to-green-600' },
  Busy: { label: 'Ocupado', icon: Clock, gradient: 'from-blue-500 to-blue-600' },
  Disconnected: { label: 'Desconectado', icon: XCircle, gradient: 'from-gray-500 to-gray-600' },
  Unresponsive: { label: 'Sem Resposta', icon: AlertCircle, gradient: 'from-red-500 to-red-600' },
};

export default function RobotStatus() {
  const filters = useFilterStore((state) => state.getFilters());
  // Usar todos os filtros disponíveis, não apenas folderId, robotId ou machineId
  const hasFilters = !!(filters.folderId || filters.robotId || filters.machineId || filters.processKey || filters.releaseKey || filters.state || filters.startDate || filters.endDate);
  // Habilitar sempre, mesmo sem pasta selecionada (mostra dados de todas as pastas)
  const { data, isLoading } = useSessionsStats(hasFilters ? filters : undefined, true);

  const chartData = useMemo(() => {
    if (!data) return [];
    
    return data.map(stat => ({
      name: stat.title,
      value: stat.count,
      color: COLORS[stat.title as keyof typeof COLORS] || '#6b7280',
      label: STATUS_CONFIG[stat.title as keyof typeof STATUS_CONFIG]?.label || stat.title,
    }));
  }, [data]);

  const totalRobots = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const config = STATUS_CONFIG[data.name as keyof typeof STATUS_CONFIG];
      const percentage = totalRobots > 0 ? ((data.value / totalRobots) * 100).toFixed(1) : 0;
      
      return (
        <div className="bg-slate-900 dark:bg-slate-800 p-3 rounded-lg shadow-xl border border-slate-700 dark:border-slate-600">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
            <span className="font-semibold text-slate-100 dark:text-slate-200">{data.label}</span>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-slate-300 dark:text-slate-400">Quantidade:</span>
              <span className="font-bold text-slate-100 dark:text-slate-200">{data.value}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-300 dark:text-slate-400">Percentual:</span>
              <span className="font-bold text-slate-100 dark:text-slate-200">{percentage}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload?.map((entry: any, index: number) => {
          const config = STATUS_CONFIG[entry.payload.name as keyof typeof STATUS_CONFIG];
          const Icon = config?.icon || Bot;
          const percentage = totalRobots > 0 ? ((entry.payload.value / totalRobots) * 100).toFixed(1) : 0;
          
          return (
            <div key={index} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {entry.payload.label || entry.value}
              </span>
              <span className="text-xs text-muted-foreground">
                ({entry.payload.value} - {percentage}%)
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card title="Status dos Robots" className="animate-pulse">
        <div className="h-64 bg-muted rounded" />
      </Card>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <Card 
        title="Status dos Robots"
        infoTooltip="Este gráfico mostra a distribuição dos status dos robots (sessões) baseado nos filtros aplicados. Available: robots disponíveis para execução. Busy: robots ocupados executando jobs. Disconnected: robots desconectados. Unresponsive: robots que não estão respondendo."
      >
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          <p>Nenhum dado disponível</p>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      title="Status dos Robots"
      infoTooltip="Este gráfico mostra a distribuição dos status dos robots (sessões) baseado nos filtros aplicados. Available: robots disponíveis para execução. Busy: robots ocupados executando jobs. Disconnected: robots desconectados. Unresponsive: robots que não estão respondendo."
    >
      {/* Métricas resumidas */}
      <div className="mb-4 grid grid-cols-2 gap-2">
        <div className="p-2 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-1.5 mb-1">
            <Bot className="h-3 w-3 text-blue-600" />
            <span className="text-xs font-medium text-blue-900 dark:text-blue-100">Total</span>
          </div>
          <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
            {totalRobots}
          </p>
        </div>
        <div className="p-2 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-1.5 mb-1">
            <CheckCircle2 className="h-3 w-3 text-green-600" />
            <span className="text-xs font-medium text-green-900 dark:text-green-100">Disponíveis</span>
          </div>
          <p className="text-lg font-bold text-green-900 dark:text-green-100">
            {chartData.find(d => d.name === 'Available')?.value || 0}
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <defs>
            {chartData.map((entry, index) => (
              <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                <stop offset="100%" stopColor={entry.color} stopOpacity={0.7} />
              </linearGradient>
            ))}
          </defs>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={90}
            innerRadius={40}
            fill="#8884d8"
            dataKey="value"
            animationBegin={0}
            animationDuration={800}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={`url(#gradient-${index})`}
                stroke={entry.color}
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}

