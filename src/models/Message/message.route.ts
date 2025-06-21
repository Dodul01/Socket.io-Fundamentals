import { Router } from "express";
import { MessageController } from "./message.controller";

const router = Router();

// GET /messages/:roomId
router.get("/:roomId", MessageController.getMessages);

export default router;