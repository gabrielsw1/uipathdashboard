import { useMemo, useState } from 'react';
import { useAllJobs } from '@/hooks/useAllJobs';
import { useFolders } from '@/hooks/useFolders';
import { useROIStore } from '@/store/roiStore';
import { useFilterStore } from '@/store/filterStore';
import { Card } from '../ui/Card';
import { ProcessROI } from '@/types/roi';
import { JobDto } from '@/types/orchestrator';
import { calculateROI, calculateFTE, calculateAvgExecutionTimeHours } from '@/utils/roiCalculations';
import { groupJobsByProcess } from '@/utils/calculations';
import { Select } from '../ui/Select';
import DateRangeFilter from '@/components/filters/DateRangeFilter';
import FolderFilter from '@/components/filters/FolderFilter';
import { differenceInHours, parseISO } from 'date-fns';
import { TrendingUp, TrendingDown, Clock, DollarSign, Users, AlertCircle } from 'lucide-react';

type SortField = 'processName' | 'roiValue' | 'roiPercentage' | 'fte' | 'totalJobs';
type SortDirection = 'asc' | 'desc';

export default function ROITable() {
  const { configs, robotHourlyCost, getConfig } = useROIStore();
  const { data: folders } = useFolders();
  const filters = useFilterStore((state) => state.getFilters());
  const [sortField, setSortField] = useState<SortField>('roiValue');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedFolderId, setSelectedFolderId] = useState<number | undefined>();

  // Buscar todos os jobs (com filtros aplicados)
  const { data: jobsData, isLoading: jobsLoading } = useAllJobs(
    {
      ...filters,
      ...(selectedFolderId ? { folderId: selectedFolderId } : {}),
    },
    { $expand: 'Release', $orderby: 'StartTime desc' },
    selectedFolderId || filters.folderId,
    true
  );

  const folderMap = useMemo(() => {
    const map = new Map<number, string>();
    folders?.forEach((folder) => {
      map.set(folder.Id, folder.FullyQualifiedName || folder.DisplayName);
    });
    return map;
  }, [folders]);

  // Agrupar jobs por pasta
  const groupJobsByFolder = (jobs: JobDto[]): Record<number, JobDto[]> => {
    const grouped: Record<number, JobDto[]> = {};
    
    jobs.forEach(job => {
      // Filtrar jobs "Unknown"
      const processKey = job.Release?.ProcessKey || 'Unknown';
      if (processKey === 'Unknown' || !processKey || processKey.trim() === '') {
        return;
      }

      const folderId = job.Release?.EnvironmentId || selectedFolderId || filters.folderId;
      if (folderId) {
        if (!grouped[folderId]) {
          grouped[folderId] = [];
        }
        grouped[folderId].push(job);
      }
    });
    
    return grouped;
  };

  // Calcular ROI para cada pasta
  const processROIs = useMemo(() => {
    if (!jobsData?.value || jobsData.value.length === 0 || robotHourlyCost <= 0) {
      return [];
    }

    // Agrupar jobs por pasta
    const jobsByFolder = groupJobsByFolder(jobsData.value);

    const rois: ProcessROI[] = [];

    Object.entries(jobsByFolder).forEach(([folderIdStr, jobs]) => {
      const folderId = Number(folderIdStr);
      
      if (jobs.length === 0) {
        return;
      }
      
      // Buscar configuração por pasta
      const config = getConfig(undefined, folderId);
      
      if (!config) {
        // Não tem configuração, pular
        return;
      }

      // Obter folderName
      const folderName = folderMap.get(folderId) || `Pasta ${folderId}`;

      // Calcular período selecionado no filtro (se houver)
      let selectedPeriodHours: number | undefined;
      if (filters.startDate && filters.endDate) {
        const startDate = parseISO(filters.startDate);
        const endDate = parseISO(filters.endDate);
        const hours = differenceInHours(endDate, startDate);
        // Adicionar 24 horas para incluir o último dia completo
        selectedPeriodHours = Math.max(hours + 24, 24);
      }

      // Calcular ROI considerando TODOS os jobs da pasta juntos
      // O tempo manual é o total da pasta (não multiplicado pelo número de jobs)
      const roiData = calculateROI(jobs, config, robotHourlyCost, selectedPeriodHours);
      
      // Calcular tempo médio para exibição
      const avgExecutionTimeHours = calculateAvgExecutionTimeHours(jobs);
      
      // FTE baseado no tempo economizado total
      const fte = calculateFTE(roiData.timeSavedHours, jobs.length);

      // Contar processos únicos na pasta
      const uniqueProcesses = new Set(
        jobs.map(job => job.Release?.ProcessKey || 'Unknown')
          .filter(p => p !== 'Unknown')
      );
      
      // Nome do processo (usar o primeiro ou "Múltiplos processos")
      let processName = 'Múltiplos processos';
      if (uniqueProcesses.size === 1) {
        const firstJob = jobs[0];
        if (firstJob?.Release?.Process?.Title) {
          processName = firstJob.Release.Process.Title;
        } else if (firstJob?.Release?.Name) {
          processName = firstJob.Release.Name;
        }
      } else if (uniqueProcesses.size > 1) {
        processName = `${uniqueProcesses.size} processos`;
      }

      rois.push({
        processKey: `folder-${folderId}`, // Chave única para a pasta
        processName,
        folderId,
        folderName,
        avgExecutionTimeHours,
        manualTimeHours: config.manualTimeHours, // Tempo manual total da pasta
        personHourlyCost: config.personHourlyCost,
        robotHourlyCost,
        totalJobs: jobs.length,
        totalExecutionTimeHours: roiData.totalExecutionTimeHours,
        totalManualTimeHours: roiData.totalManualTimeHours, // Tempo manual total (não multiplicado)
        timeSavedHours: roiData.timeSavedHours,
        roiValue: roiData.roiValue,
        roiPercentage: roiData.roiPercentage,
        fte,
      });
    });

    return rois;
  }, [jobsData, configs, robotHourlyCost, folderMap, selectedFolderId, filters.folderId, getConfig]);

  // Ordenar resultados
  const sortedROIs = useMemo(() => {
    const sorted = [...processROIs];
    sorted.sort((a, b) => {
      let aVal: number | string = 0;
      let bVal: number | string = 0;

      switch (sortField) {
        case 'processName':
          aVal = a.processName;
          bVal = b.processName;
          break;
        case 'roiValue':
          aVal = a.roiValue;
          bVal = b.roiValue;
          break;
        case 'roiPercentage':
          aVal = a.roiPercentage;
          bVal = b.roiPercentage;
          break;
        case 'fte':
          aVal = a.fte;
          bVal = b.fte;
          break;
        case 'totalJobs':
          aVal = a.totalJobs;
          bVal = b.totalJobs;
          break;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortDirection === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

    return sorted;
  }, [processROIs, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Pastas com ROI cadastrado
  const foldersWithROI = useMemo(() => {
    const folderIds = new Set<number>();
    configs.forEach(config => {
      if (config.folderId) {
        folderIds.add(config.folderId);
      }
    });
    return Array.from(folderIds);
  }, [configs]);

  const folderOptions = useMemo(() => {
    if (!folders) return [];
    const filtered = folders.filter(f => foldersWithROI.includes(f.Id));
    return [
      { value: '', label: 'Todas as pastas com ROI' },
      ...filtered.map((f) => ({
        value: f.Id,
        label: f.FullyQualifiedName || f.DisplayName,
      })),
    ];
  }, [folders, foldersWithROI]);

  const totalROI = useMemo(() => {
    return sortedROIs.reduce((sum, roi) => sum + roi.roiValue, 0);
  }, [sortedROIs]);

  const totalFTE = useMemo(() => {
    return sortedROIs.reduce((sum, roi) => sum + roi.fte, 0);
  }, [sortedROIs]);

  if (jobsLoading) {
    return (
      <Card title="Análise de ROI por Pasta" className="animate-pulse">
        <div className="h-64 bg-muted rounded-lg" />
      </Card>
    );
  }

  return (
    <Card
      title="Análise de ROI por Pasta"
      infoTooltip="Esta tabela mostra o ROI (Return on Investment) calculado para cada pasta que possui configuração cadastrada. O tempo manual cadastrado (ex: 8h) é o total para todos os processos da pasta juntos, não por processo. O ROI considera o tempo economizado pela automação menos o custo do robô."
    >
      {/* Filtros de Data e Pasta */}
      <div className="mb-4 space-y-4">
        <DateRangeFilter folderId={selectedFolderId || filters.folderId} />
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Filtrar por Pasta (com ROI)
          </label>
          <Select
            options={folderOptions}
            value={selectedFolderId || ''}
            onChange={(val) => setSelectedFolderId(val ? Number(val) : undefined)}
            placeholder="Todas as pastas com ROI"
            searchable={true}
          />
        </div>
      </div>

      {/* Resumo */}
      {sortedROIs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900 dark:text-green-100">ROI Total</span>
            </div>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100">
              R$ {totalROI.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">FTE Total</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {totalFTE.toFixed(2)}
            </p>
          </div>
          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-purple-600" />
               <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Pastas</span>
            </div>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {sortedROIs.length}
            </p>
          </div>
        </div>
      )}

      {/* Avisos */}
      {robotHourlyCost <= 0 && (
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center gap-2 text-amber-800 dark:text-amber-200">
          <AlertCircle className="h-5 w-5" />
          <span>Configure o custo por hora do robô nos parâmetros globais para calcular o ROI.</span>
        </div>
      )}

      {sortedROIs.length === 0 && configs.length > 0 && robotHourlyCost > 0 && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center gap-2 text-blue-800 dark:text-blue-200">
          <AlertCircle className="h-5 w-5" />
           <span>Nenhuma pasta com configuração encontrada nos jobs disponíveis.</span>
        </div>
      )}

      {configs.length === 0 && (
        <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center gap-2 text-slate-800 dark:text-slate-200">
          <AlertCircle className="h-5 w-5" />
          <span>Cadastre configurações de ROI para ver os resultados aqui.</span>
        </div>
      )}

      {/* Tabela */}
      {sortedROIs.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th
                  className="text-left p-3 text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  onClick={() => handleSort('processName')}
                >
                  Processo
                  {sortField === 'processName' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th className="text-left p-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Pasta
                </th>
                <th className="text-right p-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Jobs
                </th>
                 <th className="text-right p-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                   Tempo Execução Total
                 </th>
                 <th className="text-right p-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                   Tempo Manual Total
                 </th>
                <th className="text-right p-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Tempo Economizado
                </th>
                <th
                  className="text-right p-3 text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  onClick={() => handleSort('roiValue')}
                >
                  ROI (R$)
                  {sortField === 'roiValue' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th
                  className="text-right p-3 text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  onClick={() => handleSort('roiPercentage')}
                >
                  ROI (%)
                  {sortField === 'roiPercentage' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th
                  className="text-right p-3 text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  onClick={() => handleSort('fte')}
                >
                  FTE
                  {sortField === 'fte' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {sortedROIs.map((roi) => (
                <tr
                  key={roi.processKey}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="p-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                    {roi.processName}
                  </td>
                  <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                    {roi.folderName}
                  </td>
                  <td className="p-3 text-sm text-right text-slate-700 dark:text-slate-300">
                    {roi.totalJobs}
                  </td>
                   <td className="p-3 text-sm text-right text-slate-700 dark:text-slate-300">
                     {roi.totalExecutionTimeHours.toFixed(2)}h
                   </td>
                   <td className="p-3 text-sm text-right text-slate-700 dark:text-slate-300">
                     {roi.totalManualTimeHours.toFixed(2)}h
                   </td>
                  <td className="p-3 text-sm text-right text-green-600 dark:text-green-400 font-medium">
                    {roi.timeSavedHours.toFixed(2)}h
                  </td>
                  <td className={`p-3 text-sm text-right font-semibold ${
                    roi.roiValue >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {roi.roiValue >= 0 ? (
                      <TrendingUp className="h-4 w-4 inline mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 inline mr-1" />
                    )}
                    R$ {roi.roiValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className={`p-3 text-sm text-right font-semibold ${
                    roi.roiPercentage >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {roi.roiPercentage >= 0 ? '+' : ''}
                    {roi.roiPercentage.toFixed(2)}%
                  </td>
                  <td className="p-3 text-sm text-right text-slate-700 dark:text-slate-300">
                    {roi.fte.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </Card>
  );
}

