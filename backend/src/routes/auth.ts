import { Router } from 'express'
import {
  type AuthenticatedRequest,
  verifyFirebaseToken,
} from '../middleware/verifyFirebaseToken'

const router = Router()

router.get('/me', verifyFirebaseToken, (req: AuthenticatedRequest, res) => {
  const user = req.user
  res.json({
    uid: user?.uid,
    email: user?.email,
    name: user?.name,
    provider: user?.firebase?.sign_in_provider,
  })
})

export default router
