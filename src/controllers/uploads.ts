import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export const registerUploadedFile = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  const { applicationId, fieldId } = req.body;
  if (!applicationId) {
    return res.status(400).json({ error: "Missing applicationId." });
  }

  // File metadata is stored separately so responses can reference file URLs.
  const fileRecord = await prisma.uploadedFile.create({
    data: {
      applicationId,
      fieldId: fieldId ?? null,
      url: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    },
  });

  return res.status(201).json(fileRecord);
};
