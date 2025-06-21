import { Request, Response } from "express";
import { MessageService } from "./message.service";

export class MessageController {
    static async getMessages(req: Request, res: Response) {
        const { roomId } = req.params;
        if (!roomId) res.status(400).json({ error: "roomId is required" });

        try {
            const messages = await MessageService.getMessages(roomId);
            res.json(messages.reverse());
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch messages" });
        }
    }
}
