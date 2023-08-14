import express from 'express';
import { 
    getClicks, 
    addClick,
} from '../controllers/test';
import catchAsync from '../utils/catchAsync';


const router = express.Router();

router.route('/api/server/getClickedNum')
    .get(catchAsync(getClicks))

router.route('/api/server/addClick')
    .get(catchAsync(addClick))


export default router; 
