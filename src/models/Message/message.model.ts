import mongoose, { Schema, Document } from "mongoose";
import { IMessage } from "./message.interface";

export interface IMessageDocument extends IMessage, Document {}

const MessageSchema: Schema = new Schema({
  roomId: { type: String, required: true, index: true },
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const Message = mongoose.model<IMessageDocument>("Message", MessageSchema);