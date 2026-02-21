import { Router } from 'express';

import {
  createLocation,
  deleteLocation,
  getLocations,
  updateLocation
} from '../controllers/locationsController';
import { authorizeRoles } from '../middleware/auth';

const router = Router();
const adminRoles = ['admin', 'super_admin'];

router.get('/', getLocations);
router.post('/', authorizeRoles(...adminRoles), createLocation);
router.put('/:id', authorizeRoles(...adminRoles), updateLocation);
router.delete('/:id', authorizeRoles(...adminRoles), deleteLocation);

export default router;
