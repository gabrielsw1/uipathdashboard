import { Router, Request, Response } from 'express';
import { orchestratorService } from '../services/orchestratorService';
import { AuthenticatedRequest } from '../middleware/auth';
import { JobFilters } from '../types/orchestrator';

const router = Router();

router.get('/count', async (req: AuthenticatedRequest, res: Response, next) => {
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
    const stats = await orchestratorService.getCountStats(filters, req.folderId);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

router.get('/jobs', async (req: AuthenticatedRequest, res: Response, next) => {
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
    const stats = await orchestratorService.getJobsStats(filters, req.folderId);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

router.get('/sessions', async (req: AuthenticatedRequest, res: Response, next) => {
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
    const stats = await orchestratorService.getSessionsStats(filters, req.folderId);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

router.get('/licenses', async (req: Request, res: Response, next) => {
  try {
    const days = req.query.days ? parseInt(req.query.days as string, 10) : undefined;
    const tenantId = req.query.tenantId ? parseInt(req.query.tenantId as string, 10) : undefined;
    const stats = await orchestratorService.getLicenseStats(days, tenantId);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

router.get('/licenses/consumption', async (req: Request, res: Response, next) => {
  try {
    const days = req.query.days ? parseInt(req.query.days as string, 10) : undefined;
    const tenantId = req.query.tenantId ? parseInt(req.query.tenantId as string, 10) : undefined;
    const stats = await orchestratorService.getConsumptionLicenseStats(days, tenantId);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

export default router;

