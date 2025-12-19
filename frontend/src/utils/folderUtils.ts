import { FolderDto } from '@/types/orchestrator';

export interface FolderTreeNode {
  folder: FolderDto;
  children: FolderTreeNode[];
  level: number;
}

/**
 * Constrói uma árvore hierárquica de pastas a partir de uma lista plana
 */
export function buildFolderTree(folders: FolderDto[]): FolderTreeNode[] {
  // Criar mapa de pastas por ID para acesso rápido
  const folderMap = new Map<number, FolderDto>();
  folders.forEach(folder => {
    folderMap.set(folder.Id, folder);
  });

  // Criar nós da árvore
  const nodeMap = new Map<number, FolderTreeNode>();
  folders.forEach(folder => {
    nodeMap.set(folder.Id, {
      folder,
      children: [],
      level: 0,
    });
  });

  // Construir hierarquia
  const rootNodes: FolderTreeNode[] = [];
  
  folders.forEach(folder => {
    const node = nodeMap.get(folder.Id)!;
    
    if (folder.ParentId && nodeMap.has(folder.ParentId)) {
      // É uma subpasta
      const parentNode = nodeMap.get(folder.ParentId)!;
      parentNode.children.push(node);
      // Calcular nível baseado no pai
      node.level = parentNode.level + 1;
    } else {
      // É uma pasta raiz
      rootNodes.push(node);
    }
  });

  // Ordenar recursivamente
  const sortNodes = (nodes: FolderTreeNode[]) => {
    nodes.sort((a, b) => a.folder.DisplayName.localeCompare(b.folder.DisplayName));
    nodes.forEach(node => {
      if (node.children.length > 0) {
        sortNodes(node.children);
      }
    });
  };

  sortNodes(rootNodes);

  // Recalcular níveis recursivamente (caso a ordenação tenha mudado)
  const recalculateLevels = (nodes: FolderTreeNode[], level: number = 0) => {
    nodes.forEach(node => {
      node.level = level;
      if (node.children.length > 0) {
        recalculateLevels(node.children, level + 1);
      }
    });
  };

  recalculateLevels(rootNodes);

  return rootNodes;
}

/**
 * Retorna uma lista plana de todos os nós da árvore (útil para select)
 */
export function flattenFolderTree(tree: FolderTreeNode[]): FolderTreeNode[] {
  const result: FolderTreeNode[] = [];
  
  const traverse = (nodes: FolderTreeNode[]) => {
    nodes.forEach(node => {
      result.push(node);
      if (node.children.length > 0) {
        traverse(node.children);
      }
    });
  };

  traverse(tree);
  return result;
}

/**
 * Retorna todos os IDs de subpastas (incluindo a pasta pai) recursivamente
 */
export function getAllSubfolderIds(folders: FolderDto[], parentId: number): number[] {
  const result: number[] = [parentId];
  
  const findChildren = (parentId: number) => {
    folders.forEach(folder => {
      if (folder.ParentId === parentId) {
        result.push(folder.Id);
        findChildren(folder.Id); // Recursivo para subpastas
      }
    });
  };

  findChildren(parentId);
  return result;
}

/**
 * Encontra uma pasta por ID
 */
export function findFolderById(folders: FolderDto[], id: number): FolderDto | undefined {
  return folders.find(folder => folder.Id === id);
}

/**
 * Verifica se uma pasta tem subpastas
 */
export function hasSubfolders(folders: FolderDto[], folderId: number): boolean {
  return folders.some(folder => folder.ParentId === folderId);
}

