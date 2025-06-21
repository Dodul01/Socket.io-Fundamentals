import { RoomAccess } from "./roomAccess.model";

export class RoomAccessService {
  static async verify(userId: string, roomId: string): Promise<boolean> {
    const access = await RoomAccess.findOne({ userId, roomId });
    return !!access;
  }

  static async addUserToRoom(userId: string, roomId: string, isAdmin = false) {
    const access = new RoomAccess({ userId, roomId, isAdmin });
    return await access.save();
  }

  static async removeUserFromRoom(userId: string, roomId: string) {
    return await RoomAccess.deleteOne({ userId, roomId });
  }

  static async isAdmin(userId: string, roomId: string): Promise<boolean> {
    const access = await RoomAccess.findOne({ userId, roomId });
    return access?.isAdmin ?? false;
  }
}