import { JobDto, CountStats } from '@/types/orchestrator';

export function calculateAverageExecutionTime(jobs: JobDto[]): number {
  // Filtrar jobs completados (Successful ou Faulted com EndTime)
  const completedJobs = jobs.filter(
    job => (job.State === 'Successful' || job.State === 'Faulted') && (job.EndTime || job.Duration !== undefined)
  );
  
  if (completedJobs.length === 0) return 0;
  
  const totalDuration = completedJobs.reduce((sum, job) => {
    // Priorizar Duration se disponível
    if (job.Duration !== undefined && job.Duration !== null && job.Duration > 0) {
      return sum + job.Duration;
    }
    
    // Calcular a partir de StartTime e EndTime se disponíveis
    if (job.StartTime && job.EndTime) {
      const start = new Date(job.StartTime).getTime();
      const end = new Date(job.EndTime).getTime();
      const duration = (end - start) / 1000; // Converter de ms para segundos
      if (duration > 0) {
        return sum + duration;
      }
    }
    
    return sum;
  }, 0);
  
  return totalDuration / completedJobs.length;
}

export function calculateSuccessRate(jobs: JobDto[]): number {
  if (jobs.length === 0) return 0;
  
  const successful = jobs.filter(job => job.State === 'Successful').length;
  return (successful / jobs.length) * 100;
}

export function getJobCountByState(jobs: JobDto[]): Record<string, number> {
  const counts: Record<string, number> = {};
  
  jobs.forEach(job => {
    counts[job.State] = (counts[job.State] || 0) + 1;
  });
  
  return counts;
}

export function getStatsByTitle(stats: CountStats[], title: string): number {
  const stat = stats.find(s => s.title === title);
  return stat?.count || 0;
}

export function calculateTotalJobs(stats: CountStats[]): number {
  return stats.reduce((sum, stat) => sum + stat.count, 0);
}

export function groupJobsByProcess(jobs: JobDto[]): Record<string, JobDto[]> {
  const grouped: Record<string, JobDto[]> = {};
  
  jobs.forEach(job => {
    const processKey = job.Release?.ProcessKey || job.ProcessKey || 'Unknown';
    if (!grouped[processKey]) {
      grouped[processKey] = [];
    }
    grouped[processKey].push(job);
  });
  
  return grouped;
}

export function getTopProcessesByVolume(
  jobs: JobDto[], 
  top: number = 10,
  processMap?: Map<string, string>
): Array<{ processKey: string; count: number; name: string }> {
  const grouped = groupJobsByProcess(jobs);
  
  return Object.entries(grouped)
    .filter(([processKey]) => processKey !== 'Unknown' && processKey && processKey.trim() !== '') // Filtrar Unknown
    .map(([processKey, processJobs]) => {
      const firstJob = processJobs[0];
      let processName: string | undefined;
      
      // 1. Tenta obter do Process expandido no Release
      if (firstJob?.Release?.Process?.Title) {
        processName = firstJob.Release.Process.Title;
      }
      // 2. Tenta obter do mapeamento de processos
      else if (processMap && processMap.has(processKey)) {
        processName = processMap.get(processKey);
      }
      // 3. Tenta obter do Release.Name (pode ser apenas versão)
      else if (firstJob?.Release?.Name) {
        // Se Release.Name parece ser apenas uma versão (ex: "1.0.0"), não usa como nome
        const releaseName = firstJob.Release.Name;
        if (!/^\d+\.\d+/.test(releaseName)) {
          processName = releaseName;
        }
      }
      
      // Se ainda não tem nome, tenta extrair do ProcessKey (formato: "Nome:Versão")
      if (!processName && processKey.includes(':')) {
        const parts = processKey.split(':');
        if (parts.length >= 2) {
          processName = parts.slice(0, -1).join(':'); // Tudo exceto a última parte (versão)
        }
      }
      
      // Monta o nome final com versão se disponível
      const version = firstJob?.Release?.ProcessVersion || (processKey.includes(':') ? processKey.split(':').pop() : undefined);
      const name = processName 
        ? `${processName}${version ? ` (${version})` : ''}`
        : processKey; // Se ainda não tem nome, usa o processKey (mas já filtramos Unknown)
      
      return {
        processKey,
        count: processJobs.length,
        name,
      };
    })
    .filter(item => item.name !== 'Unknown' && item.name && item.name.trim() !== '') // Filtro adicional
    .sort((a, b) => b.count - a.count)
    .slice(0, top);
}

