import express from 'express';
import {createEvent,getEventDetails,registerForEvent,cancelRegistration,listUpcomingEvents,getEventStats} from '../controllers/eventControllers.js';

const router = express.Router();


router.post('/', createEvent);
router.get('/upcoming', listUpcomingEvents);
router.get('/:id', getEventDetails);

router.post('/:id/register', registerForEvent);

router.delete('/:id/register/:userId', cancelRegistration);
router.get('/:id/stats', getEventStats);

export default router;
