import { Router, Request, Response } from 'express';
import { orchestratorService } from '../services/orchestratorService';
import { AuthenticatedRequest } from '../middleware/auth';
import { ODataQueryParams, JobFilters } from '../types/orchestrator';

const router = Router();

router.get('/', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const filters: JobFilters = {
      folderId: req.folderId,
      processKey: req.query.processKey as string,
      releaseKey: req.query.releaseKey as string,
      robotId: req.query.robotId ? parseInt(req.query.robotId as string, 10) : undefined,
      state: req.query.state as any,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      machineId: req.query.machineId ? parseInt(req.query.machineId as string, 10) : undefined,
    };

    const queryParams: ODataQueryParams = {
      $filter: req.query.$filter as string,
      $orderby: req.query.$orderby as string,
      $top: req.query.$top ? parseInt(req.query.$top as string, 10) : undefined,
      $skip: req.query.$skip ? parseInt(req.query.$skip as string, 10) : undefined,
      $select: req.query.$select as string,
      $expand: req.query.$expand as string,
      $count: req.query.$count === 'true',
    };

    const result = await orchestratorService.getJobs(filters, queryParams, req.folderId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/:key', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const key = parseInt(req.params.key, 10);
    const job = await orchestratorService.getJobById(key, req.folderId);
    res.json(job);
  } catch (error) {
    next(error);
  }
});

router.post('/:key/stop', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const key = parseInt(req.params.key, 10);
    const strategy = (req.body.strategy || 'SoftStop') as 'SoftStop' | 'Kill';
    await orchestratorService.stopJob(key, strategy, req.folderId);
    res.json({ success: true, message: 'Job parado com sucesso' });
  } catch (error) {
    next(error);
  }
});

router.post('/:key/restart', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const key = parseInt(req.params.key, 10);
    await orchestratorService.restartJob(key, req.folderId);
    res.json({ success: true, message: 'Job reiniciado com sucesso' });
  } catch (error) {
    next(error);
  }
});

router.post('/:key/resume', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const key = parseInt(req.params.key, 10);
    await orchestratorService.resumeJob(key, req.folderId);
    res.json({ success: true, message: 'Job retomado com sucesso' });
  } catch (error) {
    next(error);
  }
});

export default router;

