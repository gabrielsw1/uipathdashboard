import { useState, useEffect } from 'react';
import { useFilterStore } from '@/store/filterStore';
import { getDateRangePresets } from '@/utils/dateUtils';
import { Card } from '../ui/Card';
import { Calendar, X, ChevronDown, ChevronUp } from 'lucide-react';

const presets = [
  { key: 'today' as const, label: 'Hoje', icon: '📅' },
  { key: 'last7Days' as const, label: '7 dias', icon: '📆' },
  { key: 'last30Days' as const, label: '30 dias', icon: '🗓️' },
  { key: 'last90Days' as const, label: '90 dias', icon: '📋' },
];

interface DateRangeFilterProps {
  folderId?: number; // Permite passar folderId externo (para casos como ROI onde há seleção local)
}

export default function DateRangeFilter({ folderId: externalFolderId }: DateRangeFilterProps = {}) {
  const { startDate, endDate, setDateRange, reset, folderId: storeFolderId } = useFilterStore();
  const datePresets = getDateRangePresets();
  const [showCustomRange, setShowCustomRange] = useState(false);
  
  // Usar folderId externo se fornecido, caso contrário usar do store
  const folderId = externalFolderId ?? storeFolderId;
  
  // Converter ISO string para formato YYYY-MM-DD para inputs de data
  const formatDateForInput = (dateString?: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Converter YYYY-MM-DD para ISO string (com hora 00:00:00 para início e 23:59:59 para fim)
  const formatDateFromInput = (dateString: string, isEndDate: boolean = false): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isEndDate) {
      date.setHours(23, 59, 59, 999);
    } else {
      date.setHours(0, 0, 0, 0);
    }
    return date.toISOString();
  };

  const [customStartDate, setCustomStartDate] = useState(formatDateForInput(startDate));
  const [customEndDate, setCustomEndDate] = useState(formatDateForInput(endDate));

  // Sincronizar inputs quando as datas mudarem externamente
  useEffect(() => {
    setCustomStartDate(formatDateForInput(startDate));
    setCustomEndDate(formatDateForInput(endDate));
  }, [startDate, endDate]);

  const handlePreset = (preset: 'today' | 'last7Days' | 'last30Days' | 'last90Days') => {
    const range = datePresets[preset];
    setDateRange(range.start, range.end);
    setCustomStartDate(formatDateForInput(range.start));
    setCustomEndDate(formatDateForInput(range.end));
    setShowCustomRange(false);
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };
  
  // Verificar se a data atual é um preset ou customizada
  const isPresetActive = () => {
    if (!startDate || !endDate) return false;
    return Object.values(datePresets).some(
      preset => preset.start === startDate && preset.end === endDate
    );
  };

  return (
    <Card 
      title={
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          <span>Período</span>
          {(startDate || endDate) && (
            <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-semibold rounded-full">
              Ativo
            </span>
          )}
        </div>
      }
      className="mb-4"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
        <button
          onClick={() => reset()}
          className={`
            flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border-2 transition-all text-sm font-medium
            ${!startDate && !endDate
              ? 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-400'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
            }
          `}
        >
          <X className="h-4 w-4" />
          Todos
        </button>
        {presets.map((preset) => (
          <button
            key={preset.key}
            onClick={() => handlePreset(preset.key)}
            className={`
              flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border-2 transition-all text-sm font-medium
              ${startDate && endDate && 
                startDate === datePresets[preset.key].start && 
                endDate === datePresets[preset.key].end
                ? 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-400'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
              }
            `}
          >
            <span>{preset.icon}</span>
            {preset.label}
          </button>
        ))}
      </div>
      
      {/* Seção de Range Personalizado - Colapsável */}
      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setShowCustomRange(!showCustomRange)}
          className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          type="button"
        >
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Período Personalizado
            </span>
            {startDate && endDate && !isPresetActive() && (
              <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-semibold rounded-full">
                Ativo
              </span>
            )}
          </div>
          {showCustomRange ? (
            <ChevronUp className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          )}
        </button>

        {showCustomRange && (
          <div className="mt-3 space-y-3">
            {!folderId && (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-200 flex items-center gap-2">
                  <span className="text-base">⚠️</span>
                  <span>É necessário selecionar uma pasta antes de usar o período personalizado.</span>
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Data Inicial
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => {
                    if (!folderId) {
                      alert('Por favor, selecione uma pasta antes de definir o período personalizado.');
                      return;
                    }
                    const newStartDate = e.target.value;
                    setCustomStartDate(newStartDate);
                    if (newStartDate && customEndDate) {
                      const start = formatDateFromInput(newStartDate, false);
                      const end = formatDateFromInput(customEndDate, true);
                      if (new Date(start) <= new Date(end)) {
                        setDateRange(start, end);
                      } else {
                        // Se a data inicial for maior que a final, apenas atualizar o input sem aplicar
                        // O usuário precisará ajustar a data final
                      }
                    }
                  }}
                  max={customEndDate || undefined}
                  disabled={!folderId}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-slate-100 dark:disabled:bg-slate-700 disabled:cursor-not-allowed disabled:text-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Data Final
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => {
                    if (!folderId) {
                      alert('Por favor, selecione uma pasta antes de definir o período personalizado.');
                      return;
                    }
                    const newEndDate = e.target.value;
                    setCustomEndDate(newEndDate);
                    if (customStartDate && newEndDate) {
                      const start = formatDateFromInput(customStartDate, false);
                      const end = formatDateFromInput(newEndDate, true);
                      if (new Date(start) <= new Date(end)) {
                        setDateRange(start, end);
                      } else {
                        // Se a data final for menor que a inicial, apenas atualizar o input sem aplicar
                        // O usuário precisará ajustar a data inicial
                      }
                    }
                  }}
                  min={customStartDate || undefined}
                  disabled={!folderId}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-slate-100 dark:disabled:bg-slate-700 disabled:cursor-not-allowed disabled:text-slate-400"
                />
              </div>
            </div>
            {customStartDate && customEndDate && new Date(formatDateFromInput(customStartDate, false)) > new Date(formatDateFromInput(customEndDate, true)) && (
              <p className="text-xs text-red-600 dark:text-red-400">
                ⚠️ A data inicial não pode ser maior que a data final.
              </p>
            )}
          </div>
        )}
      </div>

      {startDate && endDate && (
        <div className="mt-3 p-3 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-orange-700 dark:text-orange-300 mb-1">Período selecionado:</p>
              <p className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                {formatDate(startDate)} - {formatDate(endDate)}
              </p>
            </div>
            <button
              onClick={() => {
                reset();
                setCustomStartDate('');
                setCustomEndDate('');
                setShowCustomRange(false);
              }}
              className="p-1.5 hover:bg-orange-200 dark:hover:bg-orange-800 rounded transition-colors"
              title="Limpar período"
            >
              <X className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

