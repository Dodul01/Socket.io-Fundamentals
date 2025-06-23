// new code with db
import { Server, Socket } from "socket.io";
import { User } from "../models/User/user.model";
import { Message } from "../models/Message/message.model";
// import { RoomAccessService } from "../models/RoomAccess/roomAccess.service";
import mongoose from "mongoose";
import { NotificationService } from "../models/notification/notification.service";

let io: Server;
const onlineUsers = new Map<string, Set<string>>(); // userId => Set<roomId>

interface JoinPayload {
    roomId: string;
}

interface SendMessagePayload {
    roomId: string;
    message: string;
}

const initSocket = (server: Server) => {
    io = server;

    io.on("connection", (socket: Socket) => {
        console.log("Socket connected:", socket.id);

        // Join Room
        socket.on("join", async ({ roomId, userId }: JoinPayload & { userId: string }) => {
            if (!userId || !roomId) {
                socket.emit("error", "User ID and Room ID are required");
                return;
            }

            try {
                const user = await User.findById(new mongoose.Types.ObjectId(userId));
                
                if (!user) {
                    socket.emit("error", "User not found");
                    return;
                }
                console.log("User id before has access, ", user._id);

                // const hasAccess = await RoomAccessService.verify(user._id.toString(), roomId);
                
                // if (!hasAccess) {
                //     socket.emit("error", "Access denied to room");
                //     return;
                // }

                socket.join(roomId);
                
                if (!onlineUsers.has(userId)) {
                    onlineUsers.set(userId, new Set());
                }
                onlineUsers.get(userId)!.add(roomId);

                const userName = user.name;
                io.to(roomId).emit("notification", `${userName} joined the room`);

                const messages = await Message.find({ roomId }).sort({ createdAt: -1 }).limit(20);
                socket.emit("chatHistory", messages.reverse());

                io.to(roomId).emit("roomStats", {
                    onlineCount: getOnlineUserCount(roomId),
                });

                // Save user info on socket for reuse
                socket.data.userId = userId;
                socket.data.userName = userName;

            } catch (err) {
                console.error("Join room error:", err);
                socket.emit("error", "Failed to join room");
            }
        });

        // Send Message
        socket.on("sendMessage", async ({ roomId, message }: SendMessagePayload) => {
            const userId = socket.data.userId;
            const userName = socket.data.userName;

            if (!userId || !onlineUsers.get(userId)?.has(roomId)) {
                socket.emit("error", "You must join the room before sending messages");
                return;
            }

            // save message to db
            const newMessage = new Message({ roomId, senderId: userId, senderName: userName, message });
            await newMessage.save();

            // send notification to user
            await NotificationService.saveNotification({
                userId,
                title: `New message from ${roomId}.`,
                description: `${userName} send you a message.`
            })

            io.to(roomId).emit("receiveMessage", { senderId: userId, senderName: userName, message });
        });

        // Leave Room
        socket.on("leaveRoom", ({ roomId }) => {
            const userId = socket.data.userId;
            const userName = socket.data.userName;

            if (userId && onlineUsers.get(userId)) {
                socket.leave(roomId);
                onlineUsers.get(userId)!.delete(roomId);
                io.to(roomId).emit("notification", `${userName} left the room`);
                io.to(roomId).emit("roomStats", {
                    onlineCount: getOnlineUserCount(roomId),
                });
            }
        });

        // Disconnect
        socket.on("disconnect", () => {
            const userId = socket.data.userId;
            if (userId) {
                console.log(`User disconnected: ${userId}`);
                onlineUsers.delete(userId);
            }
        });
    });
};

// Utility function for counting online users in a room
function getOnlineUserCount(roomId: string): number {
    const room = io.sockets.adapter.rooms.get(roomId);
    return room ? room.size : 0;
}

const getIO = (): Server => {
    if (!io) throw new Error("Socket.io not initialized");
    return io;
};

export const socketHelper = { initSocket, getIO };
