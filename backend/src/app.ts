import express, { Application } from "express";
import userRoutes from "./route/userRoutes";
import fileRoutes from "./route/fileRoutes";
import genAi from "./route/genAi";
import searchRouters from "./route/searchRoutes";
import chapterRoutes from "./route/chapterRoutes";
import dotenv from "dotenv";
import corsMiddleware from "./config/cors";

dotenv.config();

const app: Application = express();

app.use(corsMiddleware);
app.use(express.json());
app.use("/api/users", userRoutes);

app.use("/api/file", fileRoutes);

app.use("/api/genai", genAi);

app.use("/api/search", searchRouters);

app.use("/api/chapters", chapterRoutes);

export default app;
