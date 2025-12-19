import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  folderId?: number;
}

export function validateFolderId(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const folderId = req.query.folderId || req.body.folderId || req.headers['x-uipath-organizationunitid'];
  
  if (folderId) {
    const id = typeof folderId === 'string' ? parseInt(folderId, 10) : folderId;
    if (!isNaN(id)) {
      req.folderId = id;
    }
  }

  next();
}

