import { useMemo, useState } from 'react';
import { useFolders } from '@/hooks/useFolders';
import { useFilterStore } from '@/store/filterStore';
import { Card } from '../ui/Card';
import { Select } from '../ui/Select';
import { buildFolderTree, flattenFolderTree, hasSubfolders } from '@/utils/folderUtils';
import FolderTypeFilter from './FolderTypeFilter';
import FeedTypeFilter from './FeedTypeFilter';
import { FolderType, FeedType } from '@/types/orchestrator';
import { Filter, ChevronDown, ChevronUp, Folder } from 'lucide-react';

interface FolderFilterProps {
  darkMode?: boolean;
}

export default function FolderFilter({ darkMode = false }: FolderFilterProps = {}) {
  const { data: folders, isLoading } = useFolders();
  const { folderId, setFolderId } = useFilterStore();
  
  // Estados para filtros de tipo
  const [selectedFolderTypes, setSelectedFolderTypes] = useState<FolderType[]>([]);
  const [selectedFeedTypes, setSelectedFeedTypes] = useState<FeedType[]>([]);
  const [showTypeFilters, setShowTypeFilters] = useState(false);

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

  // Construir árvore hierárquica e achatar para exibição (usando pastas filtradas)
  const folderTree = useMemo(() => {
    if (!filteredFolders) return [];
    return buildFolderTree(filteredFolders);
  }, [filteredFolders]);

  const flatTree = useMemo(() => {
    return flattenFolderTree(folderTree);
  }, [folderTree]);

  if (isLoading) {
    return <Card title="Pasta" className="mb-4"><div className="h-10 bg-muted rounded animate-pulse" /></Card>;
  }

  const selectedFolder = filteredFolders?.find(f => f.Id === folderId);
  const hasSubs = selectedFolder ? hasSubfolders(filteredFolders || [], selectedFolder.Id) : false;
  const hasActiveTypeFilters = selectedFolderTypes.length > 0 || selectedFeedTypes.length > 0;

  return (
    <Card 
      title={
        <div className="flex items-center gap-2">
          <Folder className={`h-5 w-5 ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`} />
          <span className={darkMode ? 'text-slate-200' : 'text-slate-900'}>Pasta</span>
        </div>
      }
      className={`mb-4 ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}
    >
      {/* Seção de Filtros de Tipo - Colapsável */}
      <div className={`mb-4 pb-4 border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
        <button
          onClick={() => setShowTypeFilters(!showTypeFilters)}
          className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}`}
          type="button"
        >
          <div className="flex items-center gap-2">
            <Filter className={`h-4 w-4 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`} />
            <span className={`text-sm font-medium ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
              Filtros de Tipo
            </span>
            {hasActiveTypeFilters && (
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${darkMode ? 'bg-cyan-900/30 text-cyan-400' : 'bg-blue-100 text-blue-700'}`}>
                Ativo
              </span>
            )}
          </div>
          {showTypeFilters ? (
            <ChevronUp className={`h-4 w-4 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`} />
          ) : (
            <ChevronDown className={`h-4 w-4 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`} />
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

      {/* Dropdown de Seleção de Pasta */}
      <div>
        <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
          Selecionar Pasta
        </label>
        <Select
          options={[
            { value: '', label: 'Todas as pastas' },
            ...flatTree.map((node) => {
              const indent = '  '.repeat(node.level);
              const prefix = node.level > 0 ? '└─ ' : '';
              const displayName = node.folder.FullyQualifiedName || node.folder.DisplayName;
              const hasChildren = hasSubfolders(filteredFolders || [], node.folder.Id);
              const suffix = hasChildren ? ' (com subpastas)' : '';
              
              // Adicionar badges de tipo se disponível
              const typeBadges = [];
              if (node.folder.FolderType) {
                typeBadges.push(node.folder.FolderType);
              }
              if (node.folder.FeedType && node.folder.FeedType !== 'Undefined') {
                typeBadges.push(node.folder.FeedType);
              }
              const typeSuffix = typeBadges.length > 0 ? ` [${typeBadges.join(', ')}]` : '';
              
              // Label para exibição (pode ser truncado)
              const displayLabel = `${indent}${prefix}${displayName}${suffix}${typeSuffix}`;
              // Label completo para tooltip (sem truncamento)
              const fullLabel = `${node.folder.FullyQualifiedName || node.folder.DisplayName}${suffix}${typeSuffix}`;
              
              return {
                value: node.folder.Id,
                label: displayLabel,
                fullLabel: fullLabel, // Nome completo para tooltip
              };
            }),
          ]}
          value={folderId || ''}
          onChange={(val) => setFolderId(val ? Number(val) : undefined)}
          placeholder="Selecione uma pasta..."
          searchable={true}
        />
        
        {hasActiveTypeFilters && (
          <p className={`mt-2 text-xs ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>
            Mostrando {flatTree.length} pasta{flatTree.length !== 1 ? 's' : ''} filtrada{flatTree.length !== 1 ? 's' : ''}
          </p>
        )}
        
        {folderId && hasSubs && (
          <p className={`mt-2 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Incluindo processos de todas as subpastas
          </p>
        )}
      </div>
    </Card>
  );
}

