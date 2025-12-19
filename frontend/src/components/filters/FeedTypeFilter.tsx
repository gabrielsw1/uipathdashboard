import { useState } from 'react';
import { FeedType } from '@/types/orchestrator';
import { Card } from '../ui/Card';
import { Check, X } from 'lucide-react';

const FEED_TYPES: { value: FeedType; label: string; description: string }[] = [
  { value: 'Processes', label: 'Processes', description: 'Feed de processos' },
  { value: 'Libraries', label: 'Libraries', description: 'Feed de bibliotecas' },
  { value: 'PersonalWorkspace', label: 'Personal Workspace', description: 'Workspace pessoal' },
  { value: 'FolderHierarchy', label: 'Folder Hierarchy', description: 'Hierarquia de pastas' },
  { value: 'Undefined', label: 'Undefined', description: 'Não definido' },
];

interface FeedTypeFilterProps {
  selectedTypes: FeedType[];
  onChange: (types: FeedType[]) => void;
}

export default function FeedTypeFilter({ selectedTypes, onChange }: FeedTypeFilterProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleType = (type: FeedType) => {
    if (selectedTypes.includes(type)) {
      onChange(selectedTypes.filter(t => t !== type));
    } else {
      onChange([...selectedTypes, type]);
    }
  };

  const selectAll = () => {
    onChange(FEED_TYPES.map(t => t.value));
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <Card className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Tipo de Feed</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {selectedTypes.length === 0 
              ? 'Nenhum tipo selecionado' 
              : `${selectedTypes.length} tipo${selectedTypes.length > 1 ? 's' : ''} selecionado${selectedTypes.length > 1 ? 's' : ''}`
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={selectAll}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            type="button"
          >
            Todos
          </button>
          <button
            onClick={clearAll}
            className="text-xs text-red-600 dark:text-red-400 hover:underline"
            type="button"
          >
            Limpar
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
            type="button"
          >
            {isExpanded ? (
              <X className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            ) : (
              <Check className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-2">
          {FEED_TYPES.map((type) => {
            const isSelected = selectedTypes.includes(type.value);
            return (
              <label
                key={type.value}
                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleType(type.value)}
                  className="w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500 focus:ring-2"
                />
                <div className="flex-1">
                  <span className={`text-sm font-medium ${isSelected ? 'text-purple-900 dark:text-purple-100' : 'text-slate-700 dark:text-slate-300'}`}>
                    {type.label}
                  </span>
                  <p className="text-xs text-muted-foreground">{type.description}</p>
                </div>
                {isSelected && (
                  <Check className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                )}
              </label>
            );
          })}
        </div>
      )}
    </Card>
  );
}

