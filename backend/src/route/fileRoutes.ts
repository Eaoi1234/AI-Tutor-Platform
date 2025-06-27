import express, { Router } from 'express';
import { uploadFile } from '../controllers/fileController';
import multer from 'multer';

import roadmapService from '../service/roadmapService';  

const router: Router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), uploadFile);

router.post('/findroadmap', roadmapService);

export default router;

