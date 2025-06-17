import { Router } from "express";
import { upload } from "../middleware/multer.middleware";
import { uploadTranscript } from "../controllers/transcript.controller";

const router = Router();

router.post("/upload", upload.single("file"), uploadTranscript);

export default router;
