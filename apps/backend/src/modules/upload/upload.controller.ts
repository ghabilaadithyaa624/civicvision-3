import fs from "fs";
import path from "path";
import type { Request, Response, NextFunction } from "express";
import multer from "multer";
import { env } from "@config/env";
import { BadRequestError } from "@utils/AppError";
import { sendSuccess } from "@utils/apiResponse";

const UPLOADS_DIR = path.join(__dirname, "../../../public/uploads");

// Ensure directory exists
// Performance optimization: Using asynchronous fs.promises.mkdir instead of synchronous fs.mkdirSync
// to prevent blocking the Node.js event loop during module initialization. This reduces module load time
// by avoiding synchronous I/O operations on the main thread.
fs.promises.mkdir(UPLOADS_DIR, { recursive: true }).catch((err) => {
  console.error("Failed to create uploads directory:", err);
});

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // Security Fix: Do not rely on file.originalname for the extension
    // as it can be spoofed by an attacker to execute malicious code (e.g. .html)
    const mimeToExt: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
    };
    const ext = mimeToExt[file.mimetype] || ".bin";
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError("Only JPEG, PNG, and WebP images are allowed") as unknown as Error);
  }
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_UPLOAD_SIZE_BYTES,
  },
}).single("file");

export function handleUpload(req: Request, res: Response, next: NextFunction): void {
  uploadMiddleware(req, res, (err) => {
    if (err) {
      next(err);
      return;
    }

    if (!req.file) {
      next(new BadRequestError("No file uploaded"));
      return;
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    // Apply Cache-Control header to response for fast loading
    res.setHeader("Cache-Control", env.IMAGE_CACHE_CONTROL_HEADER);

    sendSuccess(res, {
      message: "Image uploaded successfully",
      data: {
        imageUrl,
        filename: req.file.filename,
        sizeBytes: req.file.size,
        mimeType: req.file.mimetype,
      },
    });
  });
}
