import { Router, Request, Response } from 'express';
import { orchestratorService } from '../services/orchestratorService';
import { AuthenticatedRequest } from '../middleware/auth';
import { ODataQueryParams } from '../types/orchestrator';

const router = Router();

router.get('/', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const queryParams: ODataQueryParams = {
      $filter: req.query.$filter as string,
      $orderby: req.query.$orderby as string,
      $top: req.query.$top ? parseInt(req.query.$top as string, 10) : undefined,
      $skip: req.query.$skip ? parseInt(req.query.$skip as string, 10) : undefined,
      $select: req.query.$select as string,
      $expand: req.query.$expand as string,
      $count: req.query.$count === 'true',
    };

    const result = await orchestratorService.getMachines(queryParams, req.folderId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/:key', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const key = parseInt(req.params.key, 10);
    const machine = await orchestratorService.getMachineById(key, req.folderId);
    res.json(machine);
  } catch (error) {
    next(error);
  }
});

export default router;

