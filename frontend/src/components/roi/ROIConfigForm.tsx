import { useState, useMemo } from 'react';
import { useROIStore } from '@/store/roiStore';
import { useFolders } from '@/hooks/useFolders';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { ROIConfig } from '@/types/roi';
import FolderTypeFilter from '@/components/filters/FolderTypeFilter';
import FeedTypeFilter from '@/components/filters/FeedTypeFilter';
import { FolderType, FeedType } from '@/types/orchestrator';
import { Bot, Folder, Save, X, Filter, ChevronDown, ChevronUp } from 'lucide-react';

export default function ROIConfigForm() {
  const { configs, robotHourlyCost, setRobotHourlyCost, addConfig, removeConfig } = useROIStore();
  const { data: folders } = useFolders();
  
  const [selectedFolderId, setSelectedFolderId] = useState<number | undefined>();
  const [manualTimeHours, setManualTimeHours] = useState<string>('');
  const [personHourlyCost, setPersonHourlyCost] = useState<string>('');
  const [personCount, setPersonCount] = useState<string>('1');
  const [globalRobotCost, setGlobalRobotCost] = useState<string>(robotHourlyCost.toString());
  
  // Estados para filtros de tipo de pasta
  const [selectedFolderTypes, setSelectedFolderTypes] = useState<FolderType[]>([]);
  const [selectedFeedTypes, setSelectedFeedTypes] = useState<FeedType[]>([]);
  const [showTypeFilters, setShowTypeFilters] = useState(true);

  // Filtrar pastas baseado nos tipos selecionados
  const filteredFolders = useMemo(() => {
    if (!folders) return [];
    
    return folders.filter(folder => {
      // Se nenhum tipo de FolderType está selecionado, mostrar todas
      const folderTypeMatch = selectedFolderTypes.length === 0 || 
        (folder.FolderType && selectedFolderTypes.includes(folder.FolderType));
      
      // Se nenhum tipo de FeedType está selecionado, mostrar todas
      const feedTypeMatch = selectedFeedTypes.length === 0 || 
        (folder.FeedType && selectedFeedTypes.includes(folder.FeedType));
      
      return folderTypeMatch && feedTypeMatch;
    });
  }, [folders, selectedFolderTypes, selectedFeedTypes]);

  const folderOptions = useMemo(() => {
    if (!filteredFolders) return [];
    return filteredFolders.map((f) => ({
      value: f.Id,
      label: f.FullyQualifiedName || f.DisplayName,
    }));
  }, [filteredFolders]);
  
  const hasActiveTypeFilters = selectedFolderTypes.length > 0 || selectedFeedTypes.length > 0;

  const handleSaveGlobalRobotCost = () => {
    const cost = parseFloat(globalRobotCost);
    if (!isNaN(cost) && cost >= 0) {
      setRobotHourlyCost(cost);
      // O store já salva automaticamente no servidor
      alert('Custo do robô atualizado e salvo no arquivo roi-config.json!');
    } else {
      alert('Por favor, insira um valor válido para o custo do robô.');
    }
  };

  const handleSaveConfig = () => {
    if (!selectedFolderId) {
      alert('Por favor, selecione uma pasta.');
      return;
    }

    const manualTime = parseFloat(manualTimeHours);
    const personCost = parseFloat(personHourlyCost);

    if (isNaN(manualTime) || manualTime <= 0) {
      alert('Por favor, insira um tempo manual válido (maior que 0).');
      return;
    }

    if (isNaN(personCost) || personCost < 0) {
      alert('Por favor, insira um custo por hora válido (maior ou igual a 0).');
      return;
    }

    const personCountNum = parseFloat(personCount);
    if (isNaN(personCountNum) || personCountNum <= 0) {
      alert('Por favor, insira uma quantidade de pessoas válida (maior que 0).');
      return;
    }

    const config: ROIConfig = {
      folderId: selectedFolderId,
      manualTimeHours: manualTime,
      personHourlyCost: personCost,
      personCount: personCountNum,
    };

    addConfig(config);
    
    // Limpar formulário
    setSelectedFolderId(undefined);
    setManualTimeHours('');
    setPersonHourlyCost('');
    setPersonCount('1');
    
    // O store já salva automaticamente no servidor
    alert('Configuração salva no arquivo roi-config.json!');
  };

  const handleRemoveConfig = (processKey?: string, folderId?: number) => {
    if (confirm('Tem certeza que deseja remover esta configuração?')) {
      removeConfig(processKey, folderId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Parâmetros Globais */}
      <Card title={
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <span>Parâmetros Globais</span>
        </div>
      }>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Custo por Hora do Robô (R$)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                min="0"
                value={globalRobotCost}
                onChange={(e) => setGlobalRobotCost(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
              <Button onClick={handleSaveGlobalRobotCost}>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </div>
            {robotHourlyCost > 0 && (
              <div className="mt-2 space-y-1">
                <p className="text-sm text-green-600 dark:text-green-400">
                  Valor atual: R$ {robotHourlyCost.toFixed(2)}/hora
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Custo anual (8760 horas): R$ {(robotHourlyCost * 8760).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Configuração por Pasta */}
      <Card title={
        <div className="flex items-center gap-2">
          <Folder className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <span>Configuração por Pasta</span>
        </div>
      }>
        <div className="space-y-4">
          {/* Seção de Filtros de Tipo - Colapsável */}
          <div className="pb-4 border-b border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setShowTypeFilters(!showTypeFilters)}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              type="button"
            >
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Filtros de Tipo de Pasta
                </span>
                {hasActiveTypeFilters && (
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-full">
                    Ativo
                  </span>
                )}
              </div>
              {showTypeFilters ? (
                <ChevronUp className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              )}
            </button>

            {showTypeFilters && (
              <div className="mt-3 space-y-3">
                <FolderTypeFilter
                  selectedTypes={selectedFolderTypes}
                  onChange={setSelectedFolderTypes}
                />
                <FeedTypeFilter
                  selectedTypes={selectedFeedTypes}
                  onChange={setSelectedFeedTypes}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Pasta
            </label>
            <Select
              options={[
                { value: '', label: 'Selecione uma pasta...' },
                ...folderOptions,
              ]}
              value={selectedFolderId || ''}
              onChange={(val) => setSelectedFolderId(val ? Number(val) : undefined)}
              searchable={true}
            />
            {hasActiveTypeFilters && (
              <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                Mostrando {folderOptions.length} pasta{folderOptions.length !== 1 ? 's' : ''} filtrada{folderOptions.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Tempo Manual (horas)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={manualTimeHours}
              onChange={(e) => setManualTimeHours(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="2.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Custo por Hora da Pessoa (R$)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={personHourlyCost}
              onChange={(e) => setPersonHourlyCost(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="50.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Quantidade de Pessoas
            </label>
            <input
              type="number"
              step="1"
              min="1"
              value={personCount}
              onChange={(e) => setPersonCount(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1"
            />
          </div>

          <Button onClick={handleSaveConfig} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Salvar Configuração
          </Button>
        </div>
      </Card>

      {/* Lista de Configurações Existentes */}
      {configs.length > 0 && (
        <Card title="Configurações Cadastradas">
          <div className="space-y-2">
            {configs.map((config, index) => {
              const folderName = config.folderId
                ? folderOptions.find(f => f.value === config.folderId)?.label || `Pasta ${config.folderId}`
                : null;

              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      <Folder className="h-4 w-4 inline mr-1" />
                      Pasta: {folderName}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Tempo Manual: {config.manualTimeHours}h | 
                      Custo Pessoa: R$ {config.personHourlyCost.toFixed(2)}/h | 
                      Pessoas: {config.personCount}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveConfig(undefined, config.folderId)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

