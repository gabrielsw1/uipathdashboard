import { useAllJobs } from '@/hooks/useAllJobs';
import { useFilterStore } from '@/store/filterStore';
import { Card } from '../ui/Card';
import { useMemo } from 'react';
import { formatDate } from '@/utils/dateUtils';

export default function JobsHeatmap() {
  const filters = useFilterStore((state) => state.getFilters());
  // Habilitar sempre, mesmo sem pasta selecionada (mostra dados de todas as pastas)
  const { data, isLoading } = useAllJobs(filters, { $orderby: 'StartTime desc' }, filters.folderId, true);

  const heatmapData = useMemo(() => {
    if (!data?.value) return [];

    // Agrupar por dia da semana e hora
    const heatmap: Record<string, Record<number, number>> = {};
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    data.value.forEach(job => {
      if (!job.StartTime) return;
      
      const date = new Date(job.StartTime);
      const dayOfWeek = date.getDay();
      const hour = date.getHours();
      const dayKey = days[dayOfWeek];

      if (!heatmap[dayKey]) {
        heatmap[dayKey] = {};
      }
      if (!heatmap[dayKey][hour]) {
        heatmap[dayKey][hour] = 0;
      }
      heatmap[dayKey][hour]++;
    });

    // Encontrar o valor máximo para normalizar
    const maxValue = Math.max(
      ...Object.values(heatmap).flatMap(day => Object.values(day))
    );

    return { heatmap, maxValue, days };
  }, [data]);

  const getIntensity = (value: number, max: number) => {
    if (max === 0) return 'bg-slate-100 dark:bg-slate-800';
    const intensity = value / max;
    if (intensity > 0.8) return 'bg-blue-600 dark:bg-blue-500';
    if (intensity > 0.6) return 'bg-blue-500 dark:bg-blue-400';
    if (intensity > 0.4) return 'bg-blue-400 dark:bg-blue-300';
    if (intensity > 0.2) return 'bg-blue-300 dark:bg-blue-200';
    return 'bg-blue-100 dark:bg-blue-900';
  };

  if (isLoading) {
    return (
      <Card title="Distribuição de Jobs por Hora" className="animate-pulse">
        <div className="h-64 bg-muted rounded" />
      </Card>
    );
  }

  return (
    <Card 
      title="Distribuição de Jobs por Hora e Dia da Semana"
      infoTooltip="Este heatmap mostra a intensidade de execuções de jobs combinando dia da semana (linhas) e hora do dia (colunas). Cores mais escuras indicam maior volume de execuções. Permite identificar padrões semanais e horários de maior atividade, baseado nos filtros aplicados."
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            Intensidade de execuções ao longo da semana
          </p>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Menos</span>
            <div className="flex gap-1">
              {[0.2, 0.4, 0.6, 0.8, 1].map((val) => (
                <div
                  key={val}
                  className={`w-3 h-3 rounded ${getIntensity(val, 1)}`}
                />
              ))}
            </div>
            <span className="text-muted-foreground">Mais</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-xs font-medium text-muted-foreground text-left p-2">Dia</th>
                {Array.from({ length: 24 }, (_, i) => (
                  <th
                    key={i}
                    className="text-xs font-medium text-muted-foreground text-center p-1 min-w-[24px]"
                  >
                    {i}h
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {heatmapData.days?.map((day) => (
                <tr key={day}>
                  <td className="text-sm font-medium p-2">{day}</td>
                  {Array.from({ length: 24 }, (_, hour) => {
                    const value = heatmapData.heatmap[day]?.[hour] || 0;
                    return (
                      <td key={hour} className="p-1">
                        <div
                          className={`w-full h-6 rounded transition-all hover:scale-110 cursor-pointer ${getIntensity(
                            value,
                            heatmapData.maxValue
                          )}`}
                          title={`${day} ${hour}h: ${value} jobs`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}

