import { Router } from 'express';

import { test } from '../controllers';


const router = Router();

router.get('/test',  test);

export default router;
