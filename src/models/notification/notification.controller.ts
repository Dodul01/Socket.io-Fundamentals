import { Request, Response } from "express";
import { NotificationService } from "./notification.service";

export class NotificationController {
    // Get Notification
    static async getNotifications(req: Request, res: Response) {
        try {
            const userId = req.params.userId;
            const notifications = await NotificationService.getNotifications(userId);
            
            res.status(200).json(notifications);
        } catch (error) {
            if (!res.headersSent) {
                res.status(500).json({ message: "Failed to fetch notifications", error });
            }
        }
    }

    // Create Notification
    static async createNotification(req: Request, res: Response): Promise<void> {
        try {
            const { userId, title, description } = req.body;
            const newNotification = await NotificationService.saveNotification({ userId, title, description })

            res.status(201).json(newNotification);
        } catch (error) {
            res.status(500).json({ message: "Failed to create notification", error });
        }
    }
}

