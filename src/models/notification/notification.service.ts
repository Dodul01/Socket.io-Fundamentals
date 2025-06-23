import { INotificationDocument, Notification } from "./notification.model";

export class NotificationService {
    static async saveNotification(data: {
        userId : string;
        title: string;
        description: string;  
    }):Promise<INotificationDocument>{
        const notification = new Notification({
            userId: data.userId,
            title: data.title,
            description: data.description
        });
        return await notification.save()
    }

    static async getNotifications(userId: string): Promise<INotificationDocument[]>{    
        
        console.log("From Notification service, ", userId);
        
        return await Notification.find({userId}).sort({createdAt: -1}).exec();
    }
}