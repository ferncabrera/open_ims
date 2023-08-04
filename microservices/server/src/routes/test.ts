import express from 'express';
import { 
    getClicks, 
    addClick,
    checkPoolClient 
} from '../controllers/test';
import catchAsync from '../utils/catchAsync';


const router = express.Router();

router.route('/api/server/getClickedNum')
    .get(catchAsync(getClicks))

router.route('/api/server/addClick')
    .get(catchAsync(addClick))

router.route('/api/server/poolclientcheck')
    .get(checkPoolClient)


export default router; 
