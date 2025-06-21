import mongoose, { Schema, Document } from "mongoose";
import { IRoomAccess } from "./roomAccess.interface";

export interface IRoomAccessDocument extends IRoomAccess, Document {}

const RoomAccessSchema: Schema = new Schema({
  roomId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

RoomAccessSchema.index({ roomId: 1, userId: 1 }, { unique: true });

export const RoomAccess = mongoose.model<IRoomAccessDocument>("RoomAccess", RoomAccessSchema);