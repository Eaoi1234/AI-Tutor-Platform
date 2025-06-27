import express, { Router } from "express";
import { geminiController } from "../controllers/geminiController";

const router: Router = express.Router();

router.post("/chat", geminiController)

export default router;