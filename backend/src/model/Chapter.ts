// src/models/Chapter.ts
import mongoose, { Document, Schema } from 'mongoose';

// Define the interface for a single chapter object
export interface IChapter {
    chapterName: string;
    content: string;
}

// Define the interface for the document that will be saved in MongoDB
// This will contain an array of IChapter
export interface IChapterDocument extends Document {
    originalTextHash: string;
    originalFileName?: string; // เพิ่ม: เพื่อเก็บชื่อไฟล์ต้นฉบับ
    chapters: IChapter[];
    createdAt: Date;
    // เพิ่มฟิลด์อื่นๆ ที่คุณต้องการเก็บ
    // uploadedBy?: mongoose.Types.ObjectId; // ถ้ามีระบบผู้ใช้
    // documentTitle?: string; // ถ้ามีชื่อเอกสารที่ AI สร้างหรือผู้ใช้กำหนด
}

// Define the Mongoose Schema for the IChapter interface
const ChapterContentSchema: Schema = new Schema({
    chapterName: { type: String, required: true },
    content: { type: String, required: true },
    is_finished: { type: Boolean, default: false },
}, { _id: false }); // Do not create a separate _id for subdocuments if not needed

// Define the Mongoose Schema for the main document
const ChapterSchema: Schema = new Schema({
    originalTextHash: { type: String, required: true, unique: false }, // unique: false เพราะ hash อาจซ้ำกันถ้า content ซ้ำ
    originalFileName: { type: String, required: false }, // เพิ่ม: ใน Schema
    chapters: { type: [ChapterContentSchema], required: true },
    createdAt: { type: Date, default: Date.now },
    // uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    // documentTitle: { type: String, required: false },
});

// Create and export the Mongoose Model
const Chapter = mongoose.model<IChapterDocument>('Chapter', ChapterSchema);

export default Chapter;