// src/routes/chapterRoutes.ts
import { Router } from 'express';
import {
    getAllChapterizedDocuments,
    getChapterizedDocumentById,
    getChapterizedDocumentsByFileName // ถ้าคุณใช้
} from '../service/chapterService'; // Import service functions

const router = Router();

// Endpoint เพื่อดึงเอกสารที่ถูกแบ่งบททั้งหมด
// GET /api/chapters
router.get('/', async (req, res) => {
    try {
        const documents = await getAllChapterizedDocuments();
        res.status(200).json(documents);
    } catch (error) {
        console.error('Error in GET /api/chapters:', error);
        res.status(500).json({ message: 'Failed to retrieve chapterized documents.', error: error instanceof Error ? error.message : String(error) });
    }
});

// Endpoint เพื่อดึงเอกสารที่ถูกแบ่งบทตาม ID
// GET /api/chapters/:id
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const document = await getChapterizedDocumentById(id);
        if (document) {
            res.status(200).json(document);
        } else {
            res.status(404).json({ message: 'Document not found.' });
        }
    } catch (error) {
        // หาก getChapterizedDocumentById โยน Error สำหรับ format ID ที่ผิด
        if (error instanceof Error && error.message.includes("Invalid document ID format")) {
            res.status(400).json({ message: error.message });
        } else {
            console.error(`Error in GET /api/chapters/${id}:`, error);
            res.status(500).json({ message: 'Failed to retrieve document.', error: error instanceof Error ? error.message : String(error) });
        }
    }
});

// Endpoint เพื่อดึงเอกสารที่ถูกแบ่งบทตามชื่อไฟล์ (ถ้าคุณเพิ่ม originalFileName)
// GET /api/chapters/byFileName/:fileName
router.get('/byFileName/:fileName', async (req, res) => {
    const { fileName } = req.params;
    try {
        const documents = await getChapterizedDocumentsByFileName(fileName);
        if (documents.length > 0) {
            res.status(200).json(documents);
        } else {
            res.status(404).json({ message: 'Documents with this file name not found.' });
        }
    } catch (error) {
        console.error(`Error in GET /api/chapters/byFileName/${fileName}:`, error);
        res.status(500).json({ message: 'Failed to retrieve documents by file name.', error: error instanceof Error ? error.message : String(error) });
    }
});

export default router;