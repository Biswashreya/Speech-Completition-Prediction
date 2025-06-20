import { Request, Response } from "express";
import path from "path";
import { runPython } from "../scripts/runPython";
import fs from "fs/promises";

export const initialPreprocessing = async (req: Request, res: Response) => {
  try {
    const inputCsv = path.join(
      __dirname,
      "../../data/clustered_embeddings.csv"
    );
    const outputJSON = path.join(__dirname, "../../data/output_gain.json");

    const args = [
      "--input",
      inputCsv,
      "--output",
      outputJSON,
      "--samples",
      "10",
      "--stopword-weight",
      "0.3",
    ];

    console.log("Running python script");
    const result = await runPython("gain-curve.py", args);

    console.log("Python result:", result);

    const jsonContent = await fs.readFile(outputJSON, "utf-8");
    const data = JSON.parse(jsonContent);

    res.status(200).json(data);
  } catch (e: any) {
    console.error("Error in initialPreprocessing:", e.message);
    res.status(500).json({ message: "Server error", details: e.message });
  }
};
