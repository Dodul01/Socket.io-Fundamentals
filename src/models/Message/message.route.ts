import { Router } from "express";
import { MessageController } from "./message.controller";

const router = Router();

router.get("/:roomId", MessageController.getMessages);

export const  MessageRouter = router;