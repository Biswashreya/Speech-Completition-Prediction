import { Router } from "express";
import { upload } from "../middleware/multer.middleware";
import {
  generateEmbeddingsAndClusters,
  uploadTranscript,
} from "../controllers/transcript.controller";

const router = Router();

router.post("/upload", upload.single("file"), uploadTranscript);
router.post("/embed_cluster", generateEmbeddingsAndClusters);

export default router;
