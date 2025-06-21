import { Request, Response } from "express";
import path from "path";
import { runPython } from "../scripts/runPython";

export const uploadTranscript = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    console.log("Uploaded file: ", req.file.filename);

    const inputCsv = path.join(__dirname, "../../data/transcript.csv");
    const outputCsv = path.join(
      __dirname,
      "../../data/clustered_embeddings.csv"
    );

    const args = ["--input", inputCsv, "--output", outputCsv];

    console.log("Running embeddings + clustering script after upload...");
    const result = await runPython("embed_and_cluster.py", args);
    console.log("Python result:", result);

    res.status(200).json({
      message: "File uploaded successfully and embeddings/clustering done",
      filename: req.file.filename,
    });
  } catch (e: any) {
    console.error("Upload error: ", e.message);
    res.status(500).json({ message: "Server error", details: e.message });
  }
};

import fs from "fs/promises";

export const generateEmbeddingsAndClusters = async (
  req: Request,
  res: Response
) => {
  try {
    const inputCsv = path.join(__dirname, "../../data/transcript.csv");
    const outputCsv = path.join(
      __dirname,
      "../../data/clustered_embeddings.csv"
    );

    const args = ["--input", inputCsv, "--output", outputCsv];

    console.log("Running embeddings + clustering script");
    const result = await runPython("embed_and_cluster.py", args);

    console.log("Python result:", result);

    const csvContent = await fs.readFile(outputCsv, "utf-8");

    res
      .status(200)
      .json({ message: "Embeddings + clustering done", csvContent });
  } catch (e: any) {
    console.error("Error in generateEmbeddingsAndClusters:", e.message);
    res.status(500).json({ message: "Server error", details: e.message });
  }
};
