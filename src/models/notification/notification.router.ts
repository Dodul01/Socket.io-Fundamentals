import { Router } from "express";
import { NotificationController } from "./notification.controller";

const router = Router();

router.get("/:userId", NotificationController.getNotifications);
router.post('/', NotificationController.createNotification);

export const NotificationRouter = router;