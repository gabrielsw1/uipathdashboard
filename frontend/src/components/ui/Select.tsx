import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
import { cn } from '@/utils/cn';

interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  fullLabel?: string; // Nome completo para tooltip (opcional)
}

interface SelectProps {
  options: SelectOption[];
  value?: string | number;
  onChange: (value: string | number | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  className?: string;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = 'Selecione...',
  disabled = false,
  searchable = false,
  className,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  const filteredOptions = searchable
    ? options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Ajustar posição do dropdown
      if (dropdownRef.current && selectRef.current) {
        const rect = selectRef.current.getBoundingClientRect();
        const dropdown = dropdownRef.current;
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        const dropdownHeight = 300; // altura estimada

        if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
          // Abrir para cima
          dropdown.style.bottom = `${rect.height}px`;
          dropdown.style.top = 'auto';
        } else {
          // Abrir para baixo (padrão)
          dropdown.style.top = `${rect.height}px`;
          dropdown.style.bottom = 'auto';
        }

        // Ajustar horizontalmente se necessário
        const viewportWidth = window.innerWidth;
        const spaceRight = viewportWidth - rect.left;
        if (spaceRight < 300) {
          dropdown.style.right = '0';
          dropdown.style.left = 'auto';
        } else {
          dropdown.style.left = '0';
          dropdown.style.right = 'auto';
        }
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={selectRef} className={cn('relative w-full', className)}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'w-full flex items-center justify-between gap-2 p-2.5 rounded-lg border transition-all',
          'bg-white dark:bg-slate-800',
          'border-slate-300 dark:border-slate-600',
          'text-slate-900 dark:text-slate-100',
          'hover:border-blue-500 dark:hover:border-blue-400',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          disabled && 'opacity-50 cursor-not-allowed',
          isOpen && 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20'
        )}
      >
        <span className={cn(
          'text-sm truncate',
          !selectedOption && 'text-muted-foreground'
        )}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-slate-500 dark:text-slate-400 flex-shrink-0 transition-transform',
            isOpen && 'transform rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-60 overflow-hidden"
        >
          {searchable && (
            <div className="p-2 border-b border-slate-200 dark:border-slate-700">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full pl-8 pr-2 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
            </div>
          )}
          <div className="overflow-y-auto max-h-48">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-sm text-muted-foreground text-center">
                Nenhuma opção encontrada
              </div>
            ) : (
              filteredOptions.map((option) => {
                // Usar fullLabel se disponível, senão usar label
                const tooltipText = option.fullLabel || option.label;
                const showTooltip = tooltipText !== option.label || option.label.length > 50;
                
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    disabled={option.disabled}
                    className={cn(
                      'w-full flex items-center justify-between gap-2 px-3 py-2 text-sm transition-colors group relative',
                      'hover:bg-blue-50 dark:hover:bg-blue-900/20',
                      value === option.value && 'bg-blue-100 dark:bg-blue-900/30 font-medium',
                      option.disabled && 'opacity-50 cursor-not-allowed',
                      'text-left'
                    )}
                    title={showTooltip ? tooltipText : undefined}
                  >
                    <span className={cn(
                      'truncate',
                      value === option.value
                        ? 'text-blue-900 dark:text-blue-100'
                        : 'text-slate-700 dark:text-slate-300'
                    )}>
                      {option.label}
                    </span>
                    {value === option.value && (
                      <Check className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    )}
                    {/* Tooltip customizado para nomes longos ou quando fullLabel está disponível */}
                    {showTooltip && (
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 pointer-events-none">
                        <div className="bg-slate-900 dark:bg-slate-800 text-white dark:text-slate-100 text-xs rounded-lg py-2 px-3 shadow-xl border border-slate-700 dark:border-slate-600 max-w-xs whitespace-normal break-words">
                          {tooltipText}
                          <div className="absolute top-full left-4 -mt-1">
                            <div className="w-2 h-2 bg-slate-900 dark:bg-slate-800 border-r border-b border-slate-700 dark:border-slate-600 transform rotate-45"></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

