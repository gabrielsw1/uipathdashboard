import { useMemo } from 'react';
import { useFolders } from './useFolders';
import { useProcesses } from './useProcesses';
import { useReleases } from './useReleases';
import { useRobots } from './useRobots';
import { useMachines } from './useMachines';
import { JobFilters, ProcessFilters } from '@/types/orchestrator';

export function useFilters(folderId?: number) {
  const { data: folders } = useFolders();
  const { data: processesData } = useProcesses({ folderId } as ProcessFilters, undefined, !!folderId);
  const { data: releasesData } = useReleases(undefined, folderId);
  const { data: robotsData } = useRobots({ folderId }, undefined, folderId);
  const { data: machinesData } = useMachines(undefined, folderId);

  const processes = useMemo(() => processesData?.value || [], [processesData]);
  const releases = useMemo(() => releasesData?.value || [], [releasesData]);
  const robots = useMemo(() => robotsData?.value || [], [robotsData]);
  const machines = useMemo(() => machinesData?.value || [], [machinesData]);

  return {
    folders: folders || [],
    processes,
    releases,
    robots,
    machines,
  };
}

