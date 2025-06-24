import { Server, Socket } from "socket.io";
import { User } from "../../models/User/user.model";
import mongoose from "mongoose";
import { Message } from "../../models/Message/message.model";
import onlineUsers from "../onlineUsers";
import { getOnlineUserCount } from "../utils/getOnlineUserCount";

export const joinRoomHandler = (io: Server, socket: Socket) => async ({ roomId, userId }: { roomId: string, userId: string }) => {
    if (!userId || !roomId) {
        socket.emit('error', 'User id and room id is required.');
        return;
    }
    
    try {
        const user = await User.findById(new mongoose.Types.ObjectId(userId));

        if (!user) socket.emit('error', 'User not found.');

        socket.join(roomId);
        
        if(!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
        onlineUsers.get(userId);

        socket.data.userId = userId;
        socket.data.userName = user?.name;
        
        
        io.to(roomId).emit('notification', `${user?.name} joined the room.`);

        const messages = await Message.find({roomId}).sort({createdAt: -1}).limit(20);

        socket.emit('chatHistory', messages.reverse());

        io.to(roomId).emit('roomStats', {onlinecout: getOnlineUserCount(io, roomId)});

    } catch (error) {
        console.log(`Error Joining Room `, error);
        socket.emit('error', 'Fail to join room.');
    }
}