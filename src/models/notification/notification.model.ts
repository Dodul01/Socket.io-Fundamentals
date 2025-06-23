import mongoose, { Schema } from "mongoose";
import { INotification } from "./notification.interface";

export interface INotificationDocument extends INotification, Document {}

const NotificationSchema: Schema = new Schema({
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true }
},
    {
        timestamps: true
    });

export const Notification = mongoose.model<INotificationDocument>("Notification", NotificationSchema)