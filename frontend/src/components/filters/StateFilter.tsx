import { useFilterStore } from '@/store/filterStore';
import { Card } from '../ui/Card';
import { JobState } from '@/types/orchestrator';
import { Activity, CheckCircle2, XCircle, AlertTriangle, Play, Clock } from 'lucide-react';

const states: {
  value: JobState;
  label: string;
  icon: any;
  color: string;
  bgColor: string;
}[] = [
  {
    value: 'Successful',
    label: 'Sucesso',
    icon: CheckCircle2,
    color: 'text-green-700 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700',
  },
  {
    value: 'Faulted',
    label: 'Erro',
    icon: XCircle,
    color: 'text-red-700 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700',
  },
  {
    value: 'Canceled',
    label: 'Cancelado',
    icon: AlertTriangle,
    color: 'text-yellow-700 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700',
  },
  {
    value: 'Running',
    label: 'Executando',
    icon: Play,
    color: 'text-blue-700 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700',
  },
  {
    value: 'Pending',
    label: 'Pendente',
    icon: Clock,
    color: 'text-gray-700 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700',
  },
];

export default function StateFilter() {
  const { state, setState } = useFilterStore();

  const handleToggle = (selectedState: JobState) => {
    if (Array.isArray(state)) {
      if (state.includes(selectedState)) {
        setState(state.filter(s => s !== selectedState));
      } else {
        setState([...state, selectedState]);
      }
    } else if (state === selectedState) {
      setState(undefined);
    } else {
      setState([selectedState]);
    }
  };

  const isSelected = (selectedState: JobState) => {
    if (Array.isArray(state)) {
      return state.includes(selectedState);
    }
    return state === selectedState;
  };

  const selectedCount = Array.isArray(state) ? state.length : (state ? 1 : 0);

  return (
    <Card 
      title={
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <span>Estado do Job</span>
          {selectedCount > 0 && (
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-full">
              {selectedCount} selecionado{selectedCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      }
      className="mb-4"
    >
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        {states.map((stateConfig) => {
          const selected = isSelected(stateConfig.value);
          const Icon = stateConfig.icon;
          return (
            <button
              key={stateConfig.value}
              onClick={() => handleToggle(stateConfig.value)}
              className={`
                flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 transition-all
                ${selected 
                  ? `${stateConfig.bgColor} ${stateConfig.color} border-current font-semibold shadow-sm` 
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                }
              `}
            >
              <Icon className={`h-4 w-4 ${selected ? '' : 'text-slate-400'}`} />
              <span className="text-sm">{stateConfig.label}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

