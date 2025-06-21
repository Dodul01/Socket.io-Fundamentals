export interface IMessage {
  roomId: string;
  senderId: string;
  senderName: string;
  message: string;
  createdAt?: Date;
}
