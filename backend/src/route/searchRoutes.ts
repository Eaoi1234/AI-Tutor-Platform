import express, { Router } from 'express';
import { searchController } from '../controllers/searchController';
import { scrapController } from '../controllers/scrapController';


const router: express.Router = express.Router();



router.post('/search', searchController)

router.get('/scrap', scrapController)


export default router;  