import type { Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from './verifyFirebaseToken'

export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  if (req.appUser?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access is required.' })
  }

  return next()
}
