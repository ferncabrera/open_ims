import express from 'express';
import { 
    getClicks, 
    addClick,
    seedDB
} from '../controllers/test';
import catchAsync from '../utils/catchAsync';


const router = express.Router();

router.route('/api/server/getClickedNum')
    .get(catchAsync(getClicks))

router.route('/api/server/addClick')
    .get(catchAsync(addClick))

router.route('/api/server/seed')
    .get(catchAsync(seedDB))


export default router; 
