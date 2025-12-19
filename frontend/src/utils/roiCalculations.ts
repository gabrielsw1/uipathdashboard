import { JobDto } from '@/types/orchestrator';
import { ROIConfig, ProcessROI } from '@/types/roi';
import { calculateAverageExecutionTime } from './calculations';

/**
 * Converte segundos para horas
 */
export function secondsToHours(seconds: number): number {
  return seconds / 3600;
}

/**
 * Calcula o tempo médio de execução em horas para um conjunto de jobs
 */
export function calculateAvgExecutionTimeHours(jobs: JobDto[]): number {
  const avgSeconds = calculateAverageExecutionTime(jobs);
  return secondsToHours(avgSeconds);
}

/**
 * Calcula o período em horas baseado nas datas dos jobs
 */
function calculatePeriodHours(jobs: JobDto[]): number {
  if (jobs.length === 0) return 0;

  const jobsWithDates = jobs.filter(job => job.StartTime);
  if (jobsWithDates.length === 0) return 0;

  const dates = jobsWithDates.map(job => new Date(job.StartTime!).getTime());
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  
  // Se todos os jobs são do mesmo dia, considerar 24 horas
  if (minDate === maxDate) return 24;
  
  // Calcular diferença em horas
  const diffMs = maxDate - minDate;
  const diffHours = diffMs / (1000 * 60 * 60);
  
  // Adicionar 24 horas para incluir o último dia
  return diffHours + 24;
}

/**
 * Calcula o ROI para um processo
 * O custo do robô é calculado proporcionalmente ao período analisado
 * (custo por hora × 8760 horas/ano) × (período em horas / 8760)
 * 
 * @param jobs - Array de jobs
 * @param config - Configuração de ROI
 * @param robotHourlyCost - Custo por hora do robô
 * @param selectedPeriodHours - Período selecionado pelo filtro em horas (opcional, se não fornecido usa o período dos jobs)
 */
export function calculateROI(
  jobs: JobDto[],
  config: ROIConfig,
  robotHourlyCost: number,
  selectedPeriodHours?: number
): {
  roiValue: number;
  roiPercentage: number;
  timeSavedHours: number;
  totalExecutionTimeHours: number;
  totalManualTimeHours: number;
  personCostSaved: number;
  robotCostTotal: number;
  periodHours: number;
} {
  if (jobs.length === 0) {
    return {
      roiValue: 0,
      roiPercentage: 0,
      timeSavedHours: 0,
      totalExecutionTimeHours: 0,
      totalManualTimeHours: 0,
      personCostSaved: 0,
      robotCostTotal: 0,
      periodHours: 0,
    };
  }

  // Calcular tempo total de execução de todos os jobs
  const totalExecutionTimeHours = jobs.reduce((sum, job) => {
    if (job.Duration) {
      return sum + (job.Duration / 3600); // Converter segundos para horas
    }
    if (job.StartTime && job.EndTime) {
      const start = new Date(job.StartTime).getTime();
      const end = new Date(job.EndTime).getTime();
      return sum + ((end - start) / (1000 * 3600)); // Converter ms para horas
    }
    return sum;
  }, 0);
  
  const totalJobs = jobs.length;
  
  // Tempo manual é o total da pasta (não multiplicado pelo número de jobs)
  const totalManualTimeHours = config.manualTimeHours;
  const timeSavedHours = totalManualTimeHours - totalExecutionTimeHours;
  
  // Custo da pessoa economizado (considerando quantidade de pessoas)
  // personCount padrão é 1 para compatibilidade com configurações antigas
  const personCount = config.personCount || 1;
  const personCostSaved = timeSavedHours * config.personHourlyCost * personCount;
  
  // Calcular período: usar o período selecionado no filtro se fornecido, caso contrário usar o período dos jobs
  const periodHours = selectedPeriodHours ?? calculatePeriodHours(jobs);
  
  // Custo anual do robô (8760 horas por ano)
  const robotAnnualCost = robotHourlyCost * 8760;
  
  // Custo proporcional do robô para o período analisado
  // Se o período for maior que um ano, usar o custo anual completo
  const robotCostTotal = periodHours <= 8760
    ? (robotAnnualCost * periodHours) / 8760
    : robotAnnualCost;
  
  // ROI em valor (economia da pessoa - custo proporcional do robô)
  const roiValue = personCostSaved - robotCostTotal;
  
  // ROI em percentual (considerando quantidade de pessoas)
  const manualCostTotal = totalManualTimeHours * config.personHourlyCost * personCount;
  const roiPercentage = manualCostTotal > 0 ? (roiValue / manualCostTotal) * 100 : 0;

  return {
    roiValue,
    roiPercentage,
    timeSavedHours,
    totalExecutionTimeHours,
    totalManualTimeHours,
    personCostSaved,
    robotCostTotal,
    periodHours,
  };
}

/**
 * Calcula FTE (Full-Time Equivalent)
 * Baseado em 160 horas por mês (40h/semana × 4 semanas)
 */
export function calculateFTE(
  timeSavedHours: number,
  totalJobs: number,
  jobsPerMonth?: number
): number {
  if (totalJobs === 0) return 0;
  
  // Se não fornecido, estimar jobs por mês baseado no período dos jobs
  let estimatedJobsPerMonth = jobsPerMonth;
  
  if (!estimatedJobsPerMonth && totalJobs > 0) {
    // Tentar estimar baseado nas datas dos jobs
    // Por padrão, assumir que os jobs são do último mês
    estimatedJobsPerMonth = totalJobs;
  }
  
  const hoursSavedPerMonth = (timeSavedHours / totalJobs) * (estimatedJobsPerMonth || totalJobs);
  const fte = hoursSavedPerMonth / 160; // 160 horas = 1 mês de trabalho
  
  return fte;
}

/**
 * Busca configuração de ROI (processo tem prioridade sobre pasta)
 */
export function getROIConfig(
  configs: ROIConfig[],
  processKey?: string,
  folderId?: number
): ROIConfig | undefined {
  // Prioridade: processo primeiro
  if (processKey) {
    const processConfig = configs.find((c) => c.processKey === processKey);
    if (processConfig) return processConfig;
  }
  
  // Depois pasta
  if (folderId) {
    const folderConfig = configs.find((c) => c.folderId === folderId);
    if (folderConfig) return folderConfig;
  }
  
  return undefined;
}

