import { processRoadmapWithSearch } from "../service/chatService";
import { Request, Response } from "express";

export const geminiController = async (req: Request, res: Response) => {
  const chapters = req.body.chapters;

  
  if(!chapters || !Array.isArray(chapters) || chapters.length === 0) {
    return res.status(400).json({ error: "Invalid input: chapters must be a non-empty array" });
  }

  try {
    const reply = await processRoadmapWithSearch(chapters, req.body.roadmap);
    return res.json({ reply });
  } catch (error) {
    console.error("Error in Gemini controller:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
