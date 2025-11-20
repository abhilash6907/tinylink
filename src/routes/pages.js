import express from "express";
import {
  renderDashboard,
  renderStats,
  redirectLink,
  healthCheck,
} from "../controllers/pageController.js";

const router = express.Router();

router.get("/healthz", healthCheck);
router.get("/", renderDashboard);
router.get("/code/:code", renderStats);
router.get("/:code", redirectLink);

export default router;
