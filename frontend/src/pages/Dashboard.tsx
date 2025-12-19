import { useState } from 'react';
import MetricsCards from '@/components/dashboard/MetricsCards';
import JobsChart from '@/components/dashboard/JobsChart';
import ProcessPerformance from '@/components/dashboard/ProcessPerformance';
import RobotStatus from '@/components/dashboard/RobotStatus';
import ExecutionTimeline from '@/components/dashboard/ExecutionTimeline';
import JobsHeatmap from '@/components/dashboard/JobsHeatmap';
import EfficiencyMetrics from '@/components/dashboard/EfficiencyMetrics';
import DateRangeFilter from '@/components/filters/DateRangeFilter';
import FolderFilter from '@/components/filters/FolderFilter';
import ProcessFilter from '@/components/filters/ProcessFilter';
import RobotFilter from '@/components/filters/RobotFilter';
import StateFilter from '@/components/filters/StateFilter';
import JobsTable from '@/components/tables/JobsTable';
import ProcessesTable from '@/components/tables/ProcessesTable';
import RobotsTable from '@/components/tables/RobotsTable';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useFilterStore } from '@/store/filterStore';

export default function Dashboard() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const hasActiveFilters = useFilterStore((state) => {
    const filters = state.getFilters();
    return !!(filters.folderId || filters.processKey || filters.releaseKey || filters.robotId || filters.startDate || filters.endDate || filters.state);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                UiPath Analytics Dashboard
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Visão analítica completa do UiPath Orchestrator
              </p>
            </div>
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                hasActiveFilters
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              <Filter className="h-4 w-4" />
              <span className="font-medium">Filtros</span>
              {hasActiveFilters && (
                <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs font-semibold">
                  Ativo
                </span>
              )}
              {filtersOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Filtros Colapsáveis */}
        {filtersOpen && (
          <div className="mb-6 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Filtros Avançados
              </h2>
              <button
                onClick={() => setFiltersOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <DateRangeFilter />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FolderFilter />
                <ProcessFilter />
                <RobotFilter />
              </div>
              <StateFilter />
            </div>
          </div>
        )}

        {/* Métricas Principais */}
        <section className="mb-8">
          <MetricsCards />
        </section>

        {/* Gráficos Principais */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-blue-600"></div>
            Análise de Performance
          </h2>
          
          {/* Evolução de Jobs - Largura total */}
          <div className="mb-6">
            <JobsChart />
          </div>

          {/* Performance de Processos - Largura total */}
          <div className="mb-6">
            <ProcessPerformance />
          </div>

          {/* Outros gráficos em grid 2x2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RobotStatus />
            <ExecutionTimeline />
          </div>
        </section>

        {/* Visualizações Avançadas */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-purple-600"></div>
            Insights Avançados
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <JobsHeatmap />
            <EfficiencyMetrics />
          </div>
        </section>

        {/* Tabelas Detalhadas */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-green-600"></div>
            Dados Detalhados
          </h2>
          <div className="space-y-6">
            <JobsTable />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProcessesTable />
              <RobotsTable />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
