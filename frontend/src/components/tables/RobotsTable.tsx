import { useState, useMemo } from 'react';
import { useRobots } from '@/hooks/useRobots';
import { useFilterStore } from '@/store/filterStore';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { RobotState } from '@/types/orchestrator';
import { Bot, Server, Activity, Package, CheckCircle2, Clock, XCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

type SortField = 'Name' | 'State';
type SortDirection = 'asc' | 'desc';

export default function RobotsTable() {
  const folderId = useFilterStore((state) => state.folderId);
  const [page, setPage] = useState(0);
  const [sortField, setSortField] = useState<SortField>('Name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const pageSize = 20;

  // A API não aceita $orderby ou $expand para Robots, então fazemos ordenação no frontend
  const { data, isLoading } = useRobots(
    { folderId },
    {
      $top: 1000, // Buscar mais itens para ordenar no frontend
    },
    folderId,
    !!folderId
  );

  // Ordenar no frontend já que a API não aceita $orderby
  // IMPORTANTE: useMemo deve ser chamado ANTES de qualquer return condicional
  const robots = useMemo(() => {
    const all = data?.value || [];
    const sorted = [...all].sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];
      
      if (aVal === bVal) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      
      const comparison = aVal < bVal ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    const start = page * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [data, sortField, sortDirection, page]);
  
  const total = data?.value?.length || 0;
  const totalPages = Math.ceil(total / pageSize);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStateBadge = (state?: RobotState) => {
    const config: Record<RobotState, { color: string; bgColor: string; icon: any }> = {
      Available: { 
        color: 'text-green-700 dark:text-green-400', 
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        icon: CheckCircle2
      },
      Busy: { 
        color: 'text-blue-700 dark:text-blue-400', 
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        icon: Clock
      },
      Disconnected: { 
        color: 'text-gray-700 dark:text-gray-400', 
        bgColor: 'bg-gray-100 dark:bg-gray-800',
        icon: XCircle
      },
      Unresponsive: { 
        color: 'text-red-700 dark:text-red-400', 
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        icon: AlertCircle
      },
    };
    return state ? config[state] : { color: 'text-gray-600', bgColor: 'bg-gray-100 dark:bg-gray-800', icon: Activity };
  };

  if (isLoading) {
    return (
      <Card title="Robots" className="animate-pulse">
        <div className="h-64 bg-muted rounded" />
      </Card>
    );
  }

  return (
    <Card 
      title="Robots"
      infoTooltip="Lista de todos os robots disponíveis na pasta selecionada, incluindo nome, máquina associada, status atual e tipo de hospedagem."
    >
      {!folderId && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-800 dark:text-yellow-200">
          Selecione uma pasta para ver os robots
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <th className="text-left p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" onClick={() => handleSort('Name')}>
                <div className="flex items-center gap-1">
                  <Bot className="h-3 w-3" />
                  Nome
                  {sortField === 'Name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </div>
              </th>
              <th className="text-left p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <Server className="h-3 w-3" />
                  Máquina
                </div>
              </th>
              <th className="text-left p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" onClick={() => handleSort('State')}>
                <div className="flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  Estado
                  {sortField === 'State' && (sortDirection === 'asc' ? '↑' : '↓')}
                </div>
              </th>
              <th className="text-left p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  Tipo
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {robots.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                  Nenhum robot encontrado
                </td>
              </tr>
            ) : (
              robots.map((robot) => {
                const stateBadge = getStateBadge(robot.State);
                const StateIcon = stateBadge.icon;
                return (
                  <tr key={robot.Id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3">
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {robot.Name}
                      </div>
                    </td>
                    <td className="p-3 text-sm text-slate-700 dark:text-slate-300">{robot.MachineName || '-'}</td>
                    <td className="p-3">
                      {robot.State ? (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${stateBadge.color} ${stateBadge.bgColor}`}>
                          <StateIcon className="h-3 w-3" />
                          {robot.State}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-3">
                      {robot.HostingType ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                          {robot.HostingType}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="text-sm text-muted-foreground">
          Mostrando <span className="font-semibold text-slate-900 dark:text-slate-100">{page * pageSize + 1}</span> - <span className="font-semibold text-slate-900 dark:text-slate-100">{Math.min((page + 1) * pageSize, total)}</span> de <span className="font-semibold text-slate-900 dark:text-slate-100">{total}</span>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="flex items-center gap-1"
          >
            Próxima
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

