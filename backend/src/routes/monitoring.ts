import { Router, Request, Response } from 'express';
import { orchestratorService } from '../services/orchestratorService';
import { AuthenticatedRequest } from '../middleware/auth';
import { RealtimeMetricsDto } from '../types/orchestrator';

const router = Router();

/**
 * Endpoint para métricas em tempo real
 * Retorna todas as métricas agregadas em uma única chamada
 */
router.get('/realtime', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const folderId = req.folderId;
    const timestamp = new Date().toISOString();

    // Se não houver folderId, retornar métricas vazias
    if (!folderId) {
      const emptyMetrics: RealtimeMetricsDto = {
        timestamp,
        jobs: {
          successful: 0,
          faulted: 0,
          canceled: 0,
          running: 0,
          pending: 0,
        },
        robots: {
          available: 0,
          busy: 0,
          disconnected: 0,
          unresponsive: 0,
        },
        sessions: {
          active: 0,
        },
        queues: {
          pending: 0,
          processed: 0,
          failed: 0,
        },
        processes: {
          running: 0,
        },
        performance: {
          avgExecutionTime: 0,
          throughput: 0,
        },
      };
      return res.json(emptyMetrics);
    }

    // Buscar todas as métricas em paralelo
    const [
      jobsResponse,
      robotsResponse,
      sessionsResponse,
      queuesResponse,
      processesResponse,
    ] = await Promise.all([
      // Jobs - buscar apenas os últimos para calcular performance
      orchestratorService.getJobs(
        { folderId },
        { $top: 100, $orderby: 'StartTime desc', $expand: 'Release' },
        folderId
      ),
      // Robots
      orchestratorService.getRobots({ folderId }, undefined, folderId),
      // Sessions
      orchestratorService.getSessions({ folderId }, undefined, folderId),
      // Queues - buscar todas as filas e seus itens
      orchestratorService.getQueues(undefined, folderId).catch(() => ({ value: [] })),
      // Processes - buscar processos em execução (via jobs running)
      orchestratorService.getJobs(
        { folderId, state: 'Running' },
        { $top: 1000 },
        folderId
      ),
    ]);

    // Processar Jobs
    const jobs = jobsResponse.value || [];
    const jobsByState = {
      successful: 0,
      faulted: 0,
      canceled: 0,
      running: 0,
      pending: 0,
    };

    let totalExecutionTime = 0;
    let jobsWithDuration = 0;

    jobs.forEach(job => {
      const state = job.State?.toLowerCase();
      if (state === 'successful') jobsByState.successful++;
      else if (state === 'faulted') jobsByState.faulted++;
      else if (state === 'canceled') jobsByState.canceled++;
      else if (state === 'running') jobsByState.running++;
      else if (state === 'pending') jobsByState.pending++;

      // Calcular tempo médio de execução
      if (job.Duration) {
        totalExecutionTime += job.Duration;
        jobsWithDuration++;
      } else if (job.StartTime && job.EndTime) {
        const start = new Date(job.StartTime).getTime();
        const end = new Date(job.EndTime).getTime();
        const duration = (end - start) / 1000; // em segundos
        totalExecutionTime += duration;
        jobsWithDuration++;
      }
    });

    const avgExecutionTime = jobsWithDuration > 0 ? totalExecutionTime / jobsWithDuration : 0;

    // Calcular throughput (jobs por minuto) - baseado nos últimos 5 minutos
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const recentJobs = jobs.filter(job => 
      job.StartTime && new Date(job.StartTime) >= new Date(fiveMinutesAgo)
    );
    const throughput = recentJobs.length / 5; // jobs por minuto

    // Processar Robots
    const robots = robotsResponse.value || [];
    const robotsByState = {
      available: 0,
      busy: 0,
      disconnected: 0,
      unresponsive: 0,
    };

    robots.forEach(robot => {
      const state = robot.State?.toLowerCase();
      if (state === 'available') robotsByState.available++;
      else if (state === 'busy') robotsByState.busy++;
      else if (state === 'disconnected') robotsByState.disconnected++;
      else if (state === 'unresponsive') robotsByState.unresponsive++;
    });

    // Processar Sessions
    const sessions = sessionsResponse.value || [];
    const activeSessions = sessions.filter(s => 
      s.State === 'Available' || s.State === 'Busy'
    ).length;

    // Processar Queues
    const queues = queuesResponse.value || [];
    let queueItemsPending = 0;
    let queueItemsProcessed = 0;
    let queueItemsFailed = 0;

    // Buscar itens de todas as filas
    try {
      const queueItemsPromises = queues.map(queue => 
        orchestratorService.getQueueItems(queue.Id, { $top: 1000 }, folderId)
          .catch(() => ({ value: [] }))
      );
      const queueItemsResponses = await Promise.all(queueItemsPromises);
      
      queueItemsResponses.forEach(response => {
        const items = response.value || [];
        items.forEach(item => {
          const status = item.Status?.toLowerCase();
          if (status === 'new' || status === 'inprogress' || status === 'retried') {
            queueItemsPending++;
          } else if (status === 'successful') {
            queueItemsProcessed++;
          } else if (status === 'failed' || status === 'abandoned') {
            queueItemsFailed++;
          }
        });
      });
    } catch (error) {
      console.error('Erro ao buscar itens das filas:', error);
    }

    // Processar Processes (em execução)
    const runningProcesses = processesResponse.value || [];
    const uniqueProcesses = new Set(
      runningProcesses
        .map(job => job.Release?.ProcessKey)
        .filter(Boolean)
    );
    const processesRunning = uniqueProcesses.size;

    // Montar resposta
    const metrics: RealtimeMetricsDto = {
      timestamp,
      jobs: jobsByState,
      robots: robotsByState,
      sessions: {
        active: activeSessions,
      },
      queues: {
        pending: queueItemsPending,
        processed: queueItemsProcessed,
        failed: queueItemsFailed,
      },
      processes: {
        running: processesRunning,
      },
      performance: {
        avgExecutionTime,
        throughput,
      },
    };

    res.json(metrics);
  } catch (error) {
    console.error('Erro ao buscar métricas em tempo real:', error);
    next(error);
  }
});

export default router;

