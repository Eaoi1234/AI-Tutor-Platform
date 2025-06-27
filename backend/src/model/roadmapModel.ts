// model/roadmapModel.ts

import { Schema, model, Document, Types } from 'mongoose';

// --- 1. Interfaces สำหรับโครงสร้างข้อมูลที่ละเอียดขึ้น ---

// Interface สำหรับแต่ละรายการผลลัพธ์การค้นหาที่ต้องการเก็บ
export interface IDB_SearchResultItem {
  title?: string;
  link?: string;
  snippet?: string;
  
}

// Interface สำหรับแต่ละ Chapter ที่มีแหล่งข้อมูล
export interface IDB_RoadmapChapter {
  chap: string; // ชื่อบทเรียนย่อย (e.g., "การติดตั้งและ Hello World")
  content?: string; // เนื้อหาสรุปที่สร้างจากการรวม snippet (ถ้ามี)
  link?: string[]; // ลิงก์หลักจากผลลัพธ์การค้นหาอันดับแรก
  allSearchResults?: IDB_SearchResultItem[]; // แหล่งข้อมูลจากการค้นหาทั้งหมด
}

// Interface สำหรับแต่ละ Phase
export interface IDB_RoadmapPhase {
  phase: number; // ลำดับ Phase (e.g., 1, 2, 3)
  title?: string; // ชื่อ Phase (e.g., "Phase 1: พื้นฐาน Java") - ถ้า Gemini สร้างมาให้
  description?: string; // คำอธิบาย Phase โดยรวม (จาก Gemini, ถ้ามี)
  docs: IDB_RoadmapChapter[]; // Array ของ Chapter ใน Phase นั้น
}

// 2. Interface สำหรับ Roadmap ที่เป็น Document เต็มรูปแบบจาก Mongoose
//    จะรวม _id และคุณสมบัติ/เมธอดภายในของ Mongoose (ผ่าน extends Document)
export interface IRoadmap extends Document {
  _id: Types.ObjectId; // _id จะถูกสร้างโดย Mongoose
  roadmapName: string; // ชื่อ Roadmap หลัก (e.g., "ภาษา Java")
  generatedAt: Date; // วันที่และเวลาที่ Roadmap นี้ถูกสร้าง
  phases: IDB_RoadmapPhase[]; // Array ของ Phase ทั้งหมดใน Roadmap
  // คุณอาจเพิ่ม userId?: Types.ObjectId; ถ้ามีระบบผู้ใช้ และต้องการเชื่อมโยงกับ User Model
}


export interface IRoadmapCreateData {
  roadmapName: string;
  phases: IDB_RoadmapPhase[]; // ใช้ phases ที่มีโครงสร้างละเอียดแล้ว
  // generatedAt จะถูกกำหนดโดย default ใน Schema ไม่ต้องส่งเข้ามา
  // userId?: Types.ObjectId; // ถ้ามี
}

// --- 4. Schemas สำหรับ MongoDB ---

const SearchResultItemSchema = new Schema<IDB_SearchResultItem>({
  title: { type: String },
  link: { type: String },
  snippet: { type: String },
}, { _id: false }); // ไม่สร้าง _id ให้ sub-document นี้ ถ้าไม่จำเป็น

const RoadmapChapterSchema = new Schema<IDB_RoadmapChapter>({
  chap: { type: String, required: true },
  content: { type: String },
  link: { type: [String] },
  allSearchResults: [SearchResultItemSchema], // Array ของ SearchResultItem
}, { _id: false }); // ไม่สร้าง _id ให้ sub-document นี้

const RoadmapPhaseSchema = new Schema<IDB_RoadmapPhase>({
  phase: { type: Number, required: true },
  title: { type: String },
  description: { type: String },
  docs: { type: [RoadmapChapterSchema], required: true }, // Array ของ RoadmapChapter
}, { _id: false }); // ไม่สร้าง _id ให้ sub-document นี้

const roadmapSchema = new Schema<IRoadmap>({
  roadmapName: { type: String, required: true },
  generatedAt: { type: Date, default: Date.now },
  phases: { type: [RoadmapPhaseSchema], required: true }, // Array ของ RoadmapPhase
  // userId: { type: Types.ObjectId, ref: 'User' }, // ถ้ามี User model
});

// 5. Model
export const RoadmapModel = model<IRoadmap>('Roadmap', roadmapSchema);

// 6. ฟังก์ชันสร้าง Roadmap
export const createRoadmap = async (roadmapData: IRoadmapCreateData): Promise<IRoadmap> => {
  try {
    const roadmap = new RoadmapModel(roadmapData);
    return await roadmap.save();
  } catch (error) {
    console.error("Error saving new roadmap:", error);
    throw error;
  }
};