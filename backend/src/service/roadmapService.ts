import { GoogleGenAI } from "@google/genai";
import { Request, Response } from "express";
import { createRoadmap, IRoadmap, IRoadmapCreateData } from "../model/roadmapModel";
import { processRoadmapWithSearch } from "./chatService";
import dotenv from "dotenv";


dotenv.config(); 
const apiKey = process.env.GEMINI_API_KEY 
console.log("API Key:", apiKey);
export const ai = new GoogleGenAI({ apiKey: apiKey });

async function roadmapService(req: Request, res: Response) {
  let roadmap = req.body.roadmap;
  if(!roadmap){
    res.status(400).send('Roadmap is required');
    return;
  }
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "create a roadmap for " + roadmap + "use ### to mark phases and using phase's format like this phase<number> : <what to do in this phase>, inside each phase there are only what I have to learn and seperate them using :::",
  });


  let phases = typeof response.text === "string" ? response.text.split("###") : [];
  let road = phases.map((phase, index) => {
    return {
      phase: index + 1,
      description: phase.replace('\n', '').trim()
    };
  });
  // console.log("Roadmap phases:", road.slice(1));

  const chapters = await processRoadmapWithSearch(road.slice(1),roadmap);

  // console.log("Processed chapters:", chapters);
  

  const roadmapDataForDB: IRoadmapCreateData = {
      roadmapName: roadmap,
      phases: chapters, // Explicitly set it, or let Mongoose default if omitted
    };

  
  await createRoadmap(roadmapDataForDB);
  return road
  // return await res.status(200).json({
  //   message: "roadmap created successfully", 
  // })

}
export default roadmapService;