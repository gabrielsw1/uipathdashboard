import { useState, useMemo } from 'react';
import { useProcesses } from '@/hooks/useProcesses';
import { useFilterStore } from '@/store/filterStore';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { FileText, Tag, ChevronLeft, ChevronRight } from 'lucide-react';

type SortField = 'Title' | 'Version';
type SortDirection = 'asc' | 'desc';

export default function ProcessesTable() {
  const folderId = useFilterStore((state) => state.folderId);
  const [page, setPage] = useState(0);
  const [sortField, setSortField] = useState<SortField>('Title');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const pageSize = 20;

  // A API não aceita $orderby para Processes, então fazemos ordenação no frontend
  const { data, isLoading } = useProcesses(
    { folderId } as any,
    {
      $top: 1000, // Buscar mais itens para ordenar no frontend
    },
    !!folderId
  );

  // Ordenar no frontend já que a API não aceita $orderby
  // IMPORTANTE: useMemo deve ser chamado ANTES de qualquer return condicional
  const processes = useMemo(() => {
    const all = data?.value || [];
    const sorted = [...all].sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];
      
      if (sortField === 'Title') {
        aVal = a.Title || a.Key || '';
        bVal = b.Title || b.Key || '';
      }
      
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

  if (isLoading) {
    return (
      <Card title="Processos" className="animate-pulse">
        <div className="h-64 bg-muted rounded" />
      </Card>
    );
  }

  return (
    <Card 
      title="Processos"
      infoTooltip="Lista de todos os processos RPA disponíveis na pasta selecionada, incluindo nome, versão e descrição. Os processos são específicos da pasta e suas subpastas."
    >
      {!folderId && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-800 dark:text-yellow-200">
          Selecione uma pasta para ver os processos
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <th className="text-left p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" onClick={() => handleSort('Title')}>
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Nome
                  {sortField === 'Title' && (sortDirection === 'asc' ? '↑' : '↓')}
                </div>
              </th>
              <th className="text-left p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" onClick={() => handleSort('Version')}>
                <div className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  Versão
                  {sortField === 'Version' && (sortDirection === 'asc' ? '↑' : '↓')}
                </div>
              </th>
              <th className="text-left p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Descrição</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {processes.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-muted-foreground">
                  Nenhum processo encontrado
                </td>
              </tr>
            ) : (
              processes.map((process) => (
                <tr key={process.Key} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-3">
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {process.Title || process.Key}
                    </div>
                  </td>
                  <td className="p-3">
                    {process.Version ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                        {process.Version}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="text-sm text-slate-600 dark:text-slate-400 max-w-md truncate" title={process.Description || ''}>
                      {process.Description || '-'}
                    </div>
                  </td>
                </tr>
              ))
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

