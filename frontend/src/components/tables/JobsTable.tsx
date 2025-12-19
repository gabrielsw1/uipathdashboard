import { useState, useMemo } from 'react';
import { useJobs } from '@/hooks/useJobs';
import { useFilterStore } from '@/store/filterStore';
import { useProcesses } from '@/hooks/useProcesses';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { formatDate, formatDuration } from '@/utils/dateUtils';
import { JobDto, JobState } from '@/types/orchestrator';
import { Activity, Clock, CheckCircle2, XCircle, AlertTriangle, Play, ChevronLeft, ChevronRight } from 'lucide-react';

type SortField = 'StartTime' | 'EndTime' | 'Duration' | 'State';
type SortDirection = 'asc' | 'desc';

export default function JobsTable() {
  const filters = useFilterStore((state) => state.getFilters());
  const [page, setPage] = useState(0);
  const [sortField, setSortField] = useState<SortField>('StartTime');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const pageSize = 20;

  const { data, isLoading } = useJobs(
    filters,
    {
      $orderby: `${sortField} ${sortDirection}`,
      $top: pageSize,
      $skip: page * pageSize,
      $expand: 'Release,Robot,Machine',
    },
    filters.folderId
  );


  // Busca processos para mapear ProcessKey -> Title
  const { data: processesData } = useProcesses(
    { folderId: filters.folderId } as any,
    undefined,
    !!filters.folderId
  );
  const processMap = useMemo(() => {
    const map = new Map<string, string>();
    processesData?.value?.forEach(process => {
      map.set(process.Key, process.Title);
    });
    return map;
  }, [processesData]);

  // Função para obter o nome do processo
  const getProcessName = (job: JobDto): string => {
    // Tenta obter do Process expandido primeiro
    if (job.Release?.Process?.Title) {
      return `${job.Release.Process.Title}${job.Release.ProcessVersion ? ` (${job.Release.ProcessVersion})` : ''}`;
    }
    // Tenta obter do mapeamento de processos
    const processKey = job.Release?.ProcessKey;
    if (processKey && processMap.has(processKey)) {
      const processName = processMap.get(processKey)!;
      return `${processName}${job.Release?.ProcessVersion ? ` (${job.Release.ProcessVersion})` : ''}`;
    }
    // Fallback para Release.Name ou ReleaseName
    return job.Release?.Name || job.ReleaseName || '-';
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getStateBadge = (state: JobState) => {
    const config: Record<JobState, { color: string; bgColor: string; icon: any }> = {
      Successful: { 
        color: 'text-green-700 dark:text-green-400', 
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        icon: CheckCircle2
      },
      Faulted: { 
        color: 'text-red-700 dark:text-red-400', 
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        icon: XCircle
      },
      Canceled: { 
        color: 'text-yellow-700 dark:text-yellow-400', 
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        icon: AlertTriangle
      },
      Running: { 
        color: 'text-blue-700 dark:text-blue-400', 
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        icon: Play
      },
      Pending: { 
        color: 'text-gray-700 dark:text-gray-400', 
        bgColor: 'bg-gray-100 dark:bg-gray-800',
        icon: Clock
      },
      Stopping: { 
        color: 'text-orange-700 dark:text-orange-400', 
        bgColor: 'bg-orange-100 dark:bg-orange-900/30',
        icon: Clock
      },
      Terminating: { 
        color: 'text-red-800 dark:text-red-500', 
        bgColor: 'bg-red-200 dark:bg-red-900/40',
        icon: XCircle
      },
      Resumed: { 
        color: 'text-blue-800 dark:text-blue-500', 
        bgColor: 'bg-blue-200 dark:bg-blue-900/40',
        icon: Play
      },
    };
    return config[state] || { color: 'text-gray-600', bgColor: 'bg-gray-100 dark:bg-gray-800', icon: Activity };
  };

  if (isLoading) {
    return (
      <Card title="Jobs" className="animate-pulse">
        <div className="h-64 bg-muted rounded" />
      </Card>
    );
  }

  const jobs = data?.value || [];
  const total = data?.['@odata.count'] || jobs.length;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <Card 
      title="Jobs"
      infoTooltip="Tabela detalhada de todos os jobs executados, com informações sobre processo, robot, status, duração e horários. Os dados respeitam os filtros aplicados."
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <th className="text-left p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">ID</th>
              <th className="text-left p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" onClick={() => handleSort('StartTime')}>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Início
                  {sortField === 'StartTime' && (sortDirection === 'asc' ? '↑' : '↓')}
                </div>
              </th>
              <th className="text-left p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" onClick={() => handleSort('EndTime')}>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Fim
                  {sortField === 'EndTime' && (sortDirection === 'asc' ? '↑' : '↓')}
                </div>
              </th>
              <th className="text-left p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Processo</th>
              <th className="text-left p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Robot</th>
              <th className="text-left p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" onClick={() => handleSort('State')}>
                <div className="flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  Estado
                  {sortField === 'State' && (sortDirection === 'asc' ? '↑' : '↓')}
                </div>
              </th>
              <th className="text-left p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" onClick={() => handleSort('Duration')}>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Duração
                  {sortField === 'Duration' && (sortDirection === 'asc' ? '↑' : '↓')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  Nenhum job encontrado
                </td>
              </tr>
            ) : (
              jobs.map((job) => {
                const stateBadge = getStateBadge(job.State);
                const StateIcon = stateBadge.icon;
                return (
                  <tr key={job.Id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 text-sm font-mono text-slate-600 dark:text-slate-400">{job.Id}</td>
                    <td className="p-3 text-sm text-slate-900 dark:text-slate-100">{formatDate(job.StartTime) || '-'}</td>
                    <td className="p-3 text-sm text-slate-900 dark:text-slate-100">{formatDate(job.EndTime) || '-'}</td>
                    <td className="p-3">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100 max-w-xs truncate" title={getProcessName(job)}>
                        {getProcessName(job)}
                      </div>
                    </td>
                    <td className="p-3 text-sm text-slate-700 dark:text-slate-300">{job.Robot?.Name || job.RobotName || '-'}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${stateBadge.color} ${stateBadge.bgColor}`}>
                        <StateIcon className="h-3 w-3" />
                        {job.State}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-slate-700 dark:text-slate-300">{formatDuration(job.Duration) || '-'}</td>
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

