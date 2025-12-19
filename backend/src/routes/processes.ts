import { Router, Request, Response } from 'express';
import { orchestratorService } from '../services/orchestratorService';
import { ODataQueryParams, ProcessFilters } from '../types/orchestrator';

const router = Router();

router.get('/', async (req: Request, res: Response, next) => {
  try {
    const filters: ProcessFilters = {
      folderId: req.query.folderId ? parseInt(req.query.folderId as string, 10) : undefined,
      includeSubfolders: req.query.includeSubfolders === 'true',
      feedId: req.query.feedId as string,
      searchTerm: req.query.searchTerm as string,
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

    const folderId = filters.folderId;
    const result = await orchestratorService.getProcesses(filters, queryParams, folderId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/:key', async (req: Request, res: Response, next) => {
  try {
    const key = req.params.key;
    const process = await orchestratorService.getProcessByKey(key);
    res.json(process);
  } catch (error) {
    next(error);
  }
});

router.get('/:key/versions', async (req: Request, res: Response, next) => {
  try {
    const key = req.params.key;
    const versions = await orchestratorService.getProcessVersions(key);
    res.json(versions);
  } catch (error) {
    next(error);
  }
});

router.get('/:key/arguments', async (req: Request, res: Response, next) => {
  try {
    const key = req.params.key;
    const arguments_ = await orchestratorService.getProcessArguments(key);
    res.json(arguments_);
  } catch (error) {
    next(error);
  }
});

export default router;

