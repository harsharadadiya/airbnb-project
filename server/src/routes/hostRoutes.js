import { Router } from 'express';
import { getHostListings, getHostListing, getHostBookings, getHostStats } from '../controllers/hostController.js';
import { protect, requireRole } from '../middleware/auth.js';
import { validateObjectId } from '../middleware/validate.js';

const router = Router();

router.use(protect, requireRole('host')); // only hosts can open the dashboard

router.get('/listings', getHostListings);
router.get('/listings/:id', validateObjectId(), getHostListing);
router.get('/bookings', getHostBookings);
router.get('/stats', getHostStats);

export default router;
