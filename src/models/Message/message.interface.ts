export interface IMessage {
  senderId: string;
  receiverId: string;
  text: string;
  timestamp?: Date;
}

export interface IMessageDocument {
  roomId: string;
  messages: IMessage[];
}