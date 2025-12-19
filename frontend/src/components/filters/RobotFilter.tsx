import { useMemo } from 'react';
import { useRobots } from '@/hooks/useRobots';
import { useFilterStore } from '@/store/filterStore';
import { Card } from '../ui/Card';
import { Select } from '../ui/Select';
import { Bot, AlertCircle } from 'lucide-react';

export default function RobotFilter() {
  const folderId = useFilterStore((state) => state.folderId);
  const { data, isLoading } = useRobots({ folderId }, undefined, folderId, !!folderId);
  const { robotId, setRobotId } = useFilterStore();

  const robotOptions = useMemo(() => {
    if (!data?.value) return [];
    return [
      { value: '', label: 'Todos os robots' },
      ...data.value.map((robot) => ({
        value: robot.Id,
        label: robot.Name,
      })),
    ];
  }, [data]);

  if (isLoading) {
    return (
      <Card 
        title={
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <span>Robot</span>
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
          <Bot className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <span>Robot</span>
        </div>
      }
      className="mb-4"
    >
      <Select
        options={robotOptions}
        value={robotId || ''}
        onChange={(val) => setRobotId(val ? Number(val) : undefined)}
        placeholder="Selecione um robot..."
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
          Nenhum robot encontrado nesta pasta
        </div>
      )}
    </Card>
  );
}

