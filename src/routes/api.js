import express from "express";
import {
  createLink,
  getAllLinks,
  getLinkByCode,
  deleteLink,
} from "../controllers/linkController.js";

const router = express.Router();

router.post("/links", createLink);
router.get("/links", getAllLinks);
router.get("/links/:code", getLinkByCode);
router.delete("/links/:code", deleteLink);

export default router;
