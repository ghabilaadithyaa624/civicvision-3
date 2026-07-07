import { Router } from "express";
import { healthRouter } from "./health.routes";
import { authRouter } from "@modules/auth/auth.routes";
import { issuesRouter } from "@modules/issues/issues.routes";
import { uploadRouter } from "@modules/upload/upload.routes";
import { adminRouter } from "@modules/admin/admin.routes";

const v1Router = Router();

v1Router.use("/health", healthRouter);
v1Router.use("/auth", authRouter);
v1Router.use("/issues", issuesRouter);
v1Router.use("/upload", uploadRouter);
v1Router.use("/admin", adminRouter);

export { v1Router };
