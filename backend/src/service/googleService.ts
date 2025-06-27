// src/services/googleService.ts
import axios from "axios";
import dotenv from "dotenv";
import { ai } from "./roadmapService"; // Assuming this is where your AI model setup is
import Chapter, { IChapter } from "../model/Chapter"; // Import the Chapter model and IChapter interface
import crypto from "crypto"; // Import crypto module for hashing
import mongoose from "mongoose"; // <-- เพิ่มการ import mongoose เข้ามา
import { Request, Response } from "express";

dotenv.config();

const geminiApiKey = process.env.GEMINI_API_KEY as string;

export interface SearchResultItem {
  title: string;
  link: string;
  snippet: string;
}

interface SearchResponse {
  items: SearchResultItem[];
}

const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
const cx = process.env.GOOGLE_SEARCH_ENGINE_ID;

export async function searchWithGoogleProgrammableSearch(
  query: string
): Promise<SearchResultItem[] | null> {
  const apiUrl = "https://www.googleapis.com/customsearch/v1";

  try {
    const response = await axios.get<SearchResponse>(apiUrl, {
      params: {
        key: apiKey,
        cx: cx,
        q: query,
        num: 3,
        alt: "json",
      },
    });

    if (
      response.data &&
      Array.isArray(response.data.items) &&
      response.data.items.length > 0
    ) {
      return response.data.items;
    } else {
      console.log(`[ggSearch] No results found for the query: "${query}"`);
      return null;
    }
  } catch (error) {
    if ((error as any).isAxiosError) {
      const axiosError = error as any;
      console.error("[ggSearch] Axios error:", axiosError.message);
      if (axiosError.response) {
        console.error("[ggSearch] Response data:", axiosError.response.data);
        console.error(
          "[ggSearch] Response status:",
          axiosError.response.status
        );
      }
    } else {
      console.error("[ggSearch] An unexpected error occurred:", error);
    }
    return null;
  }
}

// ปรับปรุง function signature ให้รับ originalFileName และคืนค่า documentId
export const getChapterizedText = async (
  text: string,
  res: Response,
  originalFileName?: string
): Promise<{ chapters: IChapter[]; documentId: string }> => {
  if (!text || text.trim().length === 0) {
    throw new Error("Input text for chapterization cannot be empty.");
  }

  // Generate a hash of the original text to use as a unique identifier
  const originalTextHash = crypto
    .createHash("sha256")
    .update(text)
    .digest("hex");

  const prompt = `
        Please divide the following Thai text into logical chapters or sections.
        Each chapter or section should have a title and its content.
        Ensure that the entire text is covered and logically structured.
        Crucially, **correct any spelling or grammatical errors** in the Thai text during this process, but **do not alter words that are already correct**.
        Do not add any introductory or concluding remarks, explanations, or preambles.
        The output **MUST ONLY** be a JSON object containing a "message" key and a "chapters" array.
        Each object in the "chapters" array MUST have 'chapterName' and 'content' keys.
        All string values within the JSON MUST be properly escaped (e.g., double quotes " must be \\").

        Example format:

        {
            "message": "File processed and chapterized successfully.",
            "chapters": [
                {
                    "chapterName": "ชื่อบทที่ 1",
                    "content": "เนื้อหาของบทที่ 1 ที่อาจมี \\"เครื่องหมายคำพูด\\" หรืออักขระพิเศษอื่นๆ"
                },
                {
                    "chapterName": "ชื่อบทที่ 2",
                    "content": "เนื้อหาของบทที่ 2..."
                }
            ]
        }

        Text to chapterize and correct:
        ${text}
    `;

  try {
    console.log("Sending text to Gemini for chapterization...");
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      // แก้ไขการสะกดคำและโครงสร้างตรงนี้
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    if (
      !response.candidates ||
      response.candidates.length === 0 ||
      !response.candidates[0].content ||
      !response.candidates[0].content.parts ||
      response.candidates[0].content.parts.length === 0
    ) {
      throw new Error("Gemini did not return any content for chapterization.");
    }

    const geminiOutput = response.candidates[0].content.parts[0].text;
    console.log("Raw Gemini output:", geminiOutput);

    if (!geminiOutput) {
      throw new Error("Gemini did not return any content for chapterization.");
    }

    // ... โค้ดเดิม ...

    let cleanedOutput = geminiOutput.trim();

    // ตรวจสอบและแยกบล็อก JSON ออกมา
    const jsonBlockMatch = cleanedOutput.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonBlockMatch && jsonBlockMatch[1]) {
      cleanedOutput = jsonBlockMatch[1].trim();
      console.log(
        "Cleaned output (extracted from ```json block):",
        cleanedOutput
      );
    } else {
      // หากไม่มี ```json``` ให้ลองลบแค่หัวท้าย
      cleanedOutput = cleanedOutput.replace(/^```json\s*/, "").trim();
      cleanedOutput = cleanedOutput.replace(/\s*```$/, "").trim();
      console.log(
        "Cleaned output (removed leading/trailing ```json/```):",
        cleanedOutput
      );
    }
    //for log outout and cleaned output through response
    // res.send(`gemini output: ${geminiOutput}\nCleaned output: ${cleanedOutput}`);

    let chapterizedContent: IChapter[];
    let parsedGeminiResponse: { message: string; chapters: IChapter[] };
    // กำหนด Type ใหม่

    try {
      // ลองแยกวิเคราะห์ JSON เป็นโครงสร้างใหม่
      parsedGeminiResponse = JSON.parse(cleanedOutput);

      // ตรวจสอบโครงสร้าง
      if (
        !parsedGeminiResponse ||
        typeof parsedGeminiResponse !== "object" ||
        !Array.isArray(parsedGeminiResponse.chapters) ||
        parsedGeminiResponse.chapters.some(
          (item) =>
            typeof item !== "object" ||
            item === null ||
            !("chapterName" in item) ||
            !("content" in item)
        )
      ) {
        console.error(
          "Parsed JSON does not fully conform to expected structure (object with message and chapters array)."
        );
        throw new Error(
          "Gemini output is not a valid JSON object with a 'chapters' array of IChapter objects."
        );
      }
      chapterizedContent = parsedGeminiResponse.chapters; // ดึงเฉพาะส่วน chapters

      // Add the 'is_finished' key with a default value of false to each chapter
      chapterizedContent = chapterizedContent.map((chapter) => ({
        ...chapter,
        is_finished: false,
      }));
    } catch (jsonError) {
      console.error(
        "Critical Error: Failed to parse Gemini's output as valid JSON:",
        jsonError
      );
      // เพิ่มการ log ข้อความ Gemini Output ที่ล้มเหลว
      console.error("Gemini Output that failed to parse:", cleanedOutput);
      throw new Error(
        `Failed to get chapterized text: Gemini did not return valid JSON. Error: ${
          jsonError instanceof Error ? jsonError.message : String(jsonError)
        }`
      );
    }

    if (!chapterizedContent || chapterizedContent.length === 0) {
      throw new Error(
        "No valid chapters could be extracted (JSON was empty or invalid)."
      );
    }

    let savedDocumentId: string = "";
    // --- Save to MongoDB ---
    try {
      // Check if this text has already been processed and saved
      const existingEntry = await Chapter.findOne({
        originalTextHash: originalTextHash,
      });

      if (existingEntry) {
        console.log(
          "Chapterization for this text already exists in DB. Skipping save."
        );
        // แก้ไข: Type assertion สำหรับ existingEntry._id
        savedDocumentId = (
          existingEntry._id as mongoose.Types.ObjectId
        ).toString();
      } else {
        const newChapterEntry = new Chapter({
          originalTextHash: originalTextHash,
          originalFileName: originalFileName, // บันทึกชื่อไฟล์
          chapters: chapterizedContent,
        });
        const savedDoc = await newChapterEntry.save();
        // savedDoc._id ควรจะเป็น Type ที่ถูกต้องอยู่แล้ว แต่เพิ่ม assertion เพื่อความชัวร์ (ไม่จำเป็นถ้า IChapterDocument ถูกต้อง)
        savedDocumentId = (savedDoc._id as mongoose.Types.ObjectId).toString();
        console.log("Chapterized text saved to MongoDB successfully!");
      }
    } catch (dbError) {
      console.error("Error saving chapterized text to MongoDB:", dbError);
      // ไม่โยน error ออกไปตรงนี้ เพื่อให้ยังคง return chapters ได้
    }

    console.log("Final chapterized content:", chapterizedContent);
    return { chapters: chapterizedContent, documentId: savedDocumentId }; // คืนค่า chapters และ documentId
  } catch (error) {
    console.error(
      "Error in getChapterizedText:",
      error instanceof Error ? error.message : error
    );
    if (
      error instanceof Error &&
      error.message.includes("Gemini did not return valid JSON")
    ) {
      throw error;
    }
    // หากเป็น error อื่นๆ ที่ไม่ใช่จาก Gemini โดยตรง
    throw new Error(
      "Failed to process text with Gemini API for chapterization due to unexpected error."
    );
  }
};
