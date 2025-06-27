// src/controllers/fileController.ts
import { Request, Response } from 'express';
import { getTextFromDocx, getTextFromPdf } from '../service/fileService';
// import { docToDocxConvert } from '../service/docTodocxConv'; // ไม่จำเป็นต้อง import ที่นี่แล้ว เพราะใช้ใน fileService

export const uploadFile = async (req: Request, res: Response) => {   
  let file = req.file;

  console.log('filedata: ', file);

  if (!file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.mimetype === 'application/msword') {
        // getTextFromDocx จะจัดการ res ด้วยตัวเอง
        await getTextFromDocx(file, req, res);
    } else if (file.mimetype === 'application/pdf') {
        // getTextFromPdf จะจัดการ res ด้วยตัวเอง
        await getTextFromPdf(file, req, res);
    } else {
        return res.status(400).json({ message: 'Unsupported file type. Only .docx, .doc, and .pdf are supported.' });
    }
  } catch (error) {
    // ข้อผิดพลาดใดๆ ที่ยังหลุดมาถึงนี่
    console.error('Error during file upload processing in fileController:', error);
    if (!res.headersSent) { // ตรวจสอบว่ายังไม่ได้ส่ง response ไปแล้ว
        res.status(500).json({ message: 'An unexpected error occurred during file processing.', error: error instanceof Error ? error.message : String(error) });
    }
  }
  return
  // ไม่ต้องมี return หรือ res.json() ที่นี่อีก
};