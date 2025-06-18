import express, { Request, Response } from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/v1/auth", authRoutes);

app.get("/", (_: Request, res: Response) => {
  res.send("API Running");
});

export default app;
