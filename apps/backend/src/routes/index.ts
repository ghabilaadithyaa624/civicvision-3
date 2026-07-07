import { Router } from "express";
import { v1Router } from "./v1";

const apiRouter = Router();

// API versioning: each version is a fully independent router tree,
// so v2 can be introduced later without touching v1 routes/contracts.
apiRouter.use("/v1", v1Router);

export { apiRouter };
