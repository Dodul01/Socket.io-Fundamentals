import { Router } from "express";
import { RoomAccessController } from "./roomAccess.controller";

const router = Router();

router.post("/add", RoomAccessController.addUser);
router.post("/remove", RoomAccessController.removeUser);
router.get("/check", RoomAccessController.checkAccess);

export default router;