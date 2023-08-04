//generic routes that follow our custom open_ims call.
import express from 'express';
import { healthCheck } from '../controllers/open_ims';

const router = express.Router();

router.route('/api/server/open_ims')
    .get(healthCheck);

export default router;
