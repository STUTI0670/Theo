import { Router } from "express";
import multer from "multer";
import { authenticate } from "../middleware/auth";
import { registerUploadedFile } from "../controllers/uploads";

const upload = multer({ dest: "uploads/" });
const router = Router();

router.post(
  "/",
  authenticate,
  upload.single("file"),
  registerUploadedFile
);

export default router;
