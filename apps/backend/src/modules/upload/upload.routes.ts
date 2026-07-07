import { Router } from "express";
import { handleUpload } from "./upload.controller";
import { authenticate } from "@middleware/auth.middleware";

const router = Router();

// Route for file upload
router.post("/", authenticate, handleUpload);

export { router as uploadRouter };
