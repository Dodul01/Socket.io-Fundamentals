import { IMessageDocument, Message } from "./message.model";

export class MessageService {
  static async saveMessage(data: {
    roomId: string;
    senderId: string;
    senderName: string;
    message: string;
  }): Promise<IMessageDocument> {
    const msg = new Message(data);
    return await msg.save();
  }

  static async getMessages(roomId: string, limit = 20): Promise<IMessageDocument[]> {
    return await Message.find({ roomId }).sort({ createdAt: -1 }).limit(limit);
  }
}