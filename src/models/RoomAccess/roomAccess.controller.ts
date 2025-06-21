import { Request, Response } from "express";
import { RoomAccessService } from "./roomAccess.service";

export class RoomAccessController {
  static async addUser(req: Request, res: Response) {
    const { userId, roomId, isAdmin } = req.body;
    if (!userId || !roomId) res.status(400).json({ error: "userId and roomId required" });

    try {
      const result = await RoomAccessService.addUserToRoom(userId, roomId, isAdmin);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to add user to room" });
    }
  }

  static async removeUser(req: Request, res: Response) {
    const { userId, roomId } = req.body;
    if (!userId || !roomId) res.status(400).json({ error: "userId and roomId required" });

    try {
      await RoomAccessService.removeUserFromRoom(userId, roomId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove user from room" });
    }
  }

  static async checkAccess(req: Request, res: Response) {
    const { userId, roomId } = req.query;
    if (!userId || !roomId) res.status(400).json({ error: "userId and roomId required" });

    try {
      const hasAccess = await RoomAccessService.verify(userId as string, roomId as string);
      res.json({ hasAccess });
    } catch (error) {
      res.status(500).json({ error: "Failed to check access" });
    }
  }
}