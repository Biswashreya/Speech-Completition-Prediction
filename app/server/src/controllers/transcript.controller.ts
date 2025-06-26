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
    const clusteredCsv = path.join(
      __dirname,
      "../../data/clustered_embeddings.csv"
    );
    const finalCsv = path.join(__dirname, "../../data/progress_added.csv");

    // embed and cluster

    const clusterArgs = ["--input", inputCsv, "--output", clusteredCsv];

    console.log("Running embeddings + clustering script after upload...");
    const clusterResult = await runPython("embed_and_cluster.py", clusterArgs);
    console.log("Python cluster result:", clusterResult);

    // progress labels

    const labelArgs = [
      "--input",
      clusteredCsv,
      "--output",
      finalCsv,
      "--num_classes",
      "20",
      "--mode",
      "classifier",
    ];
    console.log("Running progress labeling script...");
    const labelResult = await runPython("progressbar.py", labelArgs);
    console.log("Python label result:", labelResult);

    // send res
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

export const generateLabels = async (req: Request, res: Response) => {
  try {
    const mode = req.query.mode === "regression" ? "regression" : "classifier";
    const numClasses = parseInt(req.query.num_classes as string) || 20;

    const clusteredCsv = path.join(
      __dirname,
      "../../data/clustered_embeddings.csv"
    );
    const finalCsv = path.join(__dirname, "../../data/progress_added.csv");

    const args = [
      "--input",
      clusteredCsv,
      "--output",
      finalCsv,
      "--num_classes",
      numClasses.toString(),
      "--mode",
      mode,
    ];

    console.log("Running progress labeling...");
    const result = await runPython("progressbar.py", args);
    console.log("Labeling result:", result);

    const csvContent = await fs.readFile(finalCsv, "utf-8");

    res.status(200).json({
      message: "Progress labels generated",
      mode,
      num_classes: numClasses,
      csvContent,
    });
  } catch (e: any) {
    console.error("Error in generateLabels:", e.message);
    res.status(500).json({ message: "Server error", details: e.message });
  }
};