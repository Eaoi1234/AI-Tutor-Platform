// src/service/chapterService.ts
import Chapter, { IChapterDocument } from '../model/Chapter';

/**
 * ดึงรายการเอกสารที่ถูกแบ่งบททั้งหมด
 * @returns Promise<IChapterDocument[]>
 */
export async function getAllChapterizedDocuments(): Promise<IChapterDocument[]> {
    try {
        // สามารถเลือกฟิลด์ที่จะดึงได้ เช่น .select('_id originalFileName createdAt')
        const documents = await Chapter.find().sort({ createdAt: -1 }); // เรียงจากใหม่ไปเก่า
        return documents;
    } catch (error) {
        console.error("Error fetching all chapterized documents:", error);
        throw new Error("Failed to retrieve all chapterized documents.");
    }
}

/**
 * ดึงข้อมูลบทของเอกสารตาม ID
 * @param id ID ของเอกสารใน MongoDB
 * @returns Promise<IChapterDocument | null>
 */
export async function getChapterizedDocumentById(id: string): Promise<IChapterDocument | null> {
    try {
        // ตรวจสอบว่า id เป็น ObjectId ที่ถูกต้องหรือไม่
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            // เป็นการโยน Error ที่เฉพาะเจาะจงขึ้น
            throw new Error("Invalid document ID format.");
        }
        const document = await Chapter.findById(id);
        return document;
    } catch (error) {
        console.error(`Error fetching chapterized document by ID ${id}:`, error);
        throw new Error(`Failed to retrieve chapterized document by ID ${id}.`);
    }
}

// ถ้าคุณต้องการดึงตามชื่อไฟล์ (หากเก็บ originalFileName)
export async function getChapterizedDocumentsByFileName(fileName: string): Promise<IChapterDocument[]> {
    try {
        const documents = await Chapter.find({ originalFileName: fileName }).sort({ createdAt: -1 });
        return documents;
    } catch (error) {
        console.error(`Error fetching chapterized documents by file name ${fileName}:`, error);
        throw new Error(`Failed to retrieve chapterized documents by file name ${fileName}.`);
    }
}

// ... เพิ่มฟังก์ชันอื่นๆ ที่คุณต้องการ เช่น search, update, delete