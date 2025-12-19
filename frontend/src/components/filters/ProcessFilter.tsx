import { useEffect, useMemo } from 'react';
import { useProcesses } from '@/hooks/useProcesses';
import { useFolders } from '@/hooks/useFolders';
import { useFilterStore } from '@/store/filterStore';
import { Card } from '../ui/Card';
import { Select } from '../ui/Select';
import { hasSubfolders } from '@/utils/folderUtils';
import { FileCode, AlertCircle } from 'lucide-react';

export default function ProcessFilter() {
  const folderId = useFilterStore((state) => state.folderId);
  const { data: folders } = useFolders();
  
  // Detectar se a pasta selecionada tem subpastas
  const includeSubfolders = useMemo(() => {
    if (!folderId || !folders) return false;
    return hasSubfolders(folders, folderId);
  }, [folderId, folders]);

  // VALIDAÇÃO: Garantir que folderId sempre é passado quando uma pasta está selecionada
  // Se folderId não estiver definido, não fazer requisição (enabled = false)
  const filters = useMemo(() => {
    if (!folderId) return undefined;
    return { folderId, includeSubfolders } as any;
  }, [folderId, includeSubfolders]);

  const { data, isLoading } = useProcesses(
    filters,
    undefined,
    !!folderId // Só habilitar se folderId estiver definido
  );
  const { processKey, setProcessKey } = useFilterStore();

  // Limpar processKey se o processo selecionado não existir na pasta atual
  useEffect(() => {
    if (processKey && data?.value && !data.value.some(p => p.Key === processKey)) {
      setProcessKey(undefined);
    }
  }, [data, processKey, setProcessKey]);

  const processOptions = useMemo(() => {
    if (!data?.value) return [];
    return [
      { value: '', label: 'Todos os processos' },
      ...data.value.map((process) => ({
        value: process.Key,
        label: `${process.Title}${process.Version ? ` (${process.Version})` : ''}`,
      })),
    ];
  }, [data]);

  if (isLoading) {
    return (
      <Card 
        title={
          <div className="flex items-center gap-2">
            <FileCode className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <span>Processo</span>
          </div>
        }
        className="mb-4"
      >
        <div className="h-10 bg-muted rounded-lg animate-pulse" />
      </Card>
    );
  }

  return (
    <Card 
      title={
        <div className="flex items-center gap-2">
          <FileCode className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <span>Processo</span>
        </div>
      }
      className="mb-4"
    >
      <Select
        options={processOptions}
        value={processKey || ''}
        onChange={(val) => setProcessKey(val ? String(val) : undefined)}
        placeholder="Selecione um processo..."
        disabled={!folderId}
        searchable={true}
      />
      {!folderId && (
        <div className="mt-2 flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg">
          <AlertCircle className="h-4 w-4" />
          <span>Selecione uma pasta primeiro</span>
        </div>
      )}
      {folderId && data?.value && data.value.length === 0 && (
        <div className="mt-2 text-sm text-muted-foreground">
          Nenhum processo encontrado nesta pasta
        </div>
      )}
    </Card>
  );
}

