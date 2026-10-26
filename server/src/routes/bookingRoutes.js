import { Router } from 'express';
import { createBooking, getMyBookings, cancelBooking } from '../controllers/bookingController.js';
import { protect } from '../middleware/auth.js';
import { validate, validateObjectId } from '../middleware/validate.js';
import { createBookingSchema } from '../validators/schemas.js';

const router = Router();

router.use(protect); // every booking route needs a logged-in user

router.post('/', validate({ body: createBookingSchema }), createBooking);
router.get('/me', getMyBookings);
router.patch('/:id/cancel', validateObjectId(), cancelBooking);

export default router;
