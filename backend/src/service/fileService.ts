// src/service/fileService.ts
import mammoth from 'mammoth';
import PDFParser from 'pdf-parse';
import { getChapterizedText } from './googleService';
import { Request, Response } from 'express';
import { docToDocxConvert } from './docTodocxConv';

const mapPrivateToThai: Readonly<Record<string, string>> = {
    // ... (mapPrivateToThai object remains unchanged)
    '\\uF8FE': '\\u0E48',
    '\\uF701': '\\u0E48',
    '\\uF702': '\\u0E49',
    '\\uF703': '\\u0E4A',
    '\\uF704': '\\u0E4B',
    '\\uF705': '\\u0E4C',
    '\\uF706': '\\u0E4D',
    '\\uF707': '\\u0E4E',
    '\\uF708': '\\u0E4F',
    '\\uF709': '\\u0E31',
    '\\uF70A': '\\u0E34',
    '\\uF70B': '\\u0E35',
    '\\uF70C': '\\u0E36',
    '\\uF70D': '\\u0E37',
    '\\uF70E': '\\u0E38',
    '\\uF70F': '\\u0E39',
    '\\uF710': '\\u0E4D',
    '\\uF711': '\\u0E4E',
    '\\uF712': '\\u0E4F',
    '\\uF713': '\\u0E49',
    '\\uF714': '\\u0E4D',
    '\\uF715': '\\u0E4E',
    '\\uF716': '\\u0E4F',
};


const replacePrivateUseChars = (text: string): string => {
    let newText = text;
    for (const key in mapPrivateToThai) {
        if (Object.prototype.hasOwnProperty.call(mapPrivateToThai, key)) {
            const regex = new RegExp(key, 'g');
            newText = newText.replace(regex, (mapPrivateToThai as any)[key]);
        }
    }
    return newText;
};


// เปลี่ยน return type เป็น Promise<void> เพราะ response ถูกส่งจากในนี้
export const getTextFromDocx = async (file: Express.Multer.File, req: Request, res: Response): Promise<void> => {
    console.log('Extracting text from DOCX file...');
    const originalFileName = file.originalname; // ดึงชื่อไฟล์

    try {
        const buffer = file.mimetype === 'application/msword' // .doc
            ? await docToDocxConvert(file.buffer, originalFileName) // ส่ง originalFileName ไปยัง docToDocxConvert ด้วย
            : file.buffer; // .docx

        let content = await mammoth.extractRawText({ buffer: buffer });
        let text = content.value;
        console.log('Extracted raw text from DOCX:', text.substring(0, 200) + '...'); // Log แค่บางส่วนเพื่อไม่ให้ยาวเกินไป

        // เรียก getChapterizedText พร้อมส่ง originalFileName
        const { chapters, documentId } = await getChapterizedText(text, res, originalFileName);

        if (!chapters || chapters.length === 0) {
            // ถ้า Gemini ไม่ได้คืนค่าบทมา ก็ยังคงตอบกลับด้วย Error message
            res.status(500).json({ message: 'No valid chapters could be generated from the text.' });
            return; // สำคัญ: ต้อง return ออกจาก function
        }

        console.log('Chapterized content from DOCX:', chapters);
        res.status(200).json({
            message: "File processed and chapterized successfully.",
            chapters: chapters,
            fileName: originalFileName,
            documentId: documentId
        });

    } catch (error) {
        console.error('Error in getTextFromDocx:', error);
        // ส่ง response error เพียงครั้งเดียว
        res.status(500).json({ message: 'Failed to process DOCX file for chapterization.', error: error instanceof Error ? error.message : String(error) });
    }
};


// เปลี่ยน return type เป็น Promise<void> เพราะ response ถูกส่งจากในนี้
export const getTextFromPdf = async (file: Express.Multer.File, req: Request, res: Response): Promise<void> => {
    console.log('Extracting text from PDF file...');
    const originalFileName = file.originalname; // ดึงชื่อไฟล์

    try {
        let content = file.buffer;
        let text = (await PDFParser(content)).text.normalize('NFC');
        text = replacePrivateUseChars(text); // ใช้ function ที่มีอยู่แล้ว
        console.log('Extracted raw text from PDF:', text.substring(0, 200) + '...'); // Log แค่บางส่วน

        // เรียก getChapterizedText พร้อมส่ง originalFileName
        const { chapters, documentId } = await getChapterizedText(text, res, originalFileName);

        if (!chapters || chapters.length === 0) {
            res.status(500).json({ message: 'No valid chapters could be generated from the text.' });
            return;
        }

        console.log('Chapterized content from PDF:', chapters);
        res.status(200).json({
            message: "File processed and chapterized successfully.",
            chapters: chapters,
            fileName: originalFileName,
            documentId: documentId
        });

    } catch (error) {
        console.error('Error in getTextFromPdf:', error);
        res.status(500).json({ message: 'Failed to process PDF file for chapterization.', error: error instanceof Error ? error.message : String(error) });
    }
};