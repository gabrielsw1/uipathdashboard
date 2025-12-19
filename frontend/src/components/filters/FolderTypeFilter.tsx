import { useState } from 'react';
import { FolderType } from '@/types/orchestrator';
import { Card } from '../ui/Card';
import { Check, X } from 'lucide-react';

const FOLDER_TYPES: { value: FolderType; label: string; description: string }[] = [
  { value: 'Standard', label: 'Standard', description: 'Pasta padrão' },
  { value: 'Personal', label: 'Personal', description: 'Pasta pessoal' },
  { value: 'Virtual', label: 'Virtual', description: 'Pasta virtual' },
  { value: 'Solution', label: 'Solution', description: 'Pasta de solução' },
  { value: 'DebugSolution', label: 'Debug Solution', description: 'Pasta de debug' },
];

interface FolderTypeFilterProps {
  selectedTypes: FolderType[];
  onChange: (types: FolderType[]) => void;
}

export default function FolderTypeFilter({ selectedTypes, onChange }: FolderTypeFilterProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleType = (type: FolderType) => {
    if (selectedTypes.includes(type)) {
      onChange(selectedTypes.filter(t => t !== type));
    } else {
      onChange([...selectedTypes, type]);
    }
  };

  const selectAll = () => {
    onChange(FOLDER_TYPES.map(t => t.value));
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <Card className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Tipo de Pasta</h3>
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
          {FOLDER_TYPES.map((type) => {
            const isSelected = selectedTypes.includes(type.value);
            return (
              <label
                key={type.value}
                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleType(type.value)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <div className="flex-1">
                  <span className={`text-sm font-medium ${isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-slate-700 dark:text-slate-300'}`}>
                    {type.label}
                  </span>
                  <p className="text-xs text-muted-foreground">{type.description}</p>
                </div>
                {isSelected && (
                  <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                )}
              </label>
            );
          })}
        </div>
      )}
    </Card>
  );
}

