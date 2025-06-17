import { Request, Response } from "express";

export const uploadTranscript = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    console.log("Uploaded file: ", req.file.filename);

    res.status(200).json({
      message: "File uploaded successfully",
      filename: req.file.filename,
    });
  } catch (e: any) {
    console.error("Upload error: ", e.message);
    res.status(500).json({ message: "Server error", details: e.message });
  }
};
