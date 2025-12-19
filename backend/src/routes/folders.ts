import { Router, Request, Response } from 'express';
import { orchestratorService } from '../services/orchestratorService';

const router = Router();

router.get('/', async (req: Request, res: Response, next) => {
  try {
    const folders = await orchestratorService.getFolders();
    res.json(folders);
  } catch (error) {
    next(error);
  }
});

router.get('/current-user', async (req: Request, res: Response, next) => {
  try {
    const result = await orchestratorService.getAllFoldersForCurrentUser();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;

