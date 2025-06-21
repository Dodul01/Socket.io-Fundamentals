// import { Server } from "socket.io";

// let io: Server;

// const onlineUsers = new Map<string, string>(); //userId => socketId;

// const initSocket = (server: Server) => {
//     io = server;
//     // socket connection
//     io.on('connection', (socket) => {
//         console.log('User connected: ', socket.id);

//         // join room 
//         socket.on('join', (roomId: string) => {
//             socket.join(roomId);
//             console.log(`User ${socket.id} joined room: ${roomId}`);
//             socket.to(roomId).emit("userJoined", { userId: socket.id });
//         });

//         // leave Room
//         socket.on('leaveRoom', (roomId: string) => {
//             socket.leave(roomId);
//             console.log(`User ${socket.id} left room: ${roomId}`);
//             socket.to(roomId).emit("userLeft", { userId: socket.id })
//         });

//         // Send Message
//         socket.on('sendMessage', ({ roomid, message }: { roomid: string, message: string }) => {
//             console.log(`Message from ${socket.id} to ${roomid}: ${message}`);
//             // io.to(roomid).emit("receiveMessage", {
//             //     message,
//             //     senderId: socket.id,
//             // })

//         })

//         // track online users
//         socket.on('user:online', (userId: string) => {
//             onlineUsers.set(userId, socket.id)
//         });

//         // handle disconnect - remove user from online users map
//         socket.on('disconnect', () => {
//             console.log("User disconnected: ", socket.id);
//             // remove disconnected socket from onlineUsers map
//             for (const [userId, sId] of onlineUsers.entries()) {
//                 if (sId === socket.id) {
//                     onlineUsers.delete(userId);
//                     console.log(`User Offline: ${userId}`);
//                     break;
//                 }
//             }
//         })
//     })
// }

// const getIO = () => {

//     if (!io) {
//         throw new Error('Socket.io not initialized.')
//     }

//     return io;
// }

// export const socketHelper = { initSocket, getIO };

// working 
// import { Server } from "socket.io";

// let io: Server;

// const onlineUsers = new Map<string, string>(); // userId -> socketId
// const roomMembers = new Map<string, Set<string>>(); // roomId -> Set of socketIds

// const initSocket = (server: Server) => {
//   io = server;

//   io.on("connection", (socket) => {
//     console.log("User connected:", socket.id);

//     // Join private room
//     socket.on("join", ({ roomId, userId }) => {
//       socket.join(roomId);

//       // Track room members
//       if (!roomMembers.has(roomId)) roomMembers.set(roomId, new Set());
//       roomMembers.get(roomId)?.add(socket.id);

//       onlineUsers.set(userId, socket.id);

//       io.to(roomId).emit("notification", `${userId} joined the room.`);
//       emitRoomStats(roomId);
//     });

//     // Leave room
//     socket.on("leaveRoom", ({ roomId, userId }) => {
//       socket.leave(roomId);
//       roomMembers.get(roomId)?.delete(socket.id);
//       io.to(roomId).emit("notification", `${userId} left the room.`);
//       emitRoomStats(roomId);
//     });

//     // Send message
//     socket.on("sendMessage", ({ roomId, message, userId }) => {
//       io.to(roomId).emit("receiveMessage", { userId, message });
//     });

//     // Disconnect handler
//     socket.on("disconnect", () => {
//       console.log("User disconnected:", socket.id);
//       for (const [roomId, members] of roomMembers.entries()) {
//         if (members.has(socket.id)) {
//           members.delete(socket.id);
//           io.to(roomId).emit("notification", `A user left the room.`);
//           emitRoomStats(roomId);
//         }
//       }
//       for (const [userId, sId] of onlineUsers.entries()) {
//         if (sId === socket.id) onlineUsers.delete(userId);
//       }
//     });
//   });
// };

// const emitRoomStats = (roomId: string) => {
//   const members = roomMembers.get(roomId) || new Set();
//   io.to(roomId).emit("roomStats", {
//     onlineCount: members.size,
//   });
// };

// const getIO = () => {
//   if (!io) throw new Error("Socket.io not initialized.");
//   return io;
// };

// export const socketHelper = { initSocket, getIO };

// new code with db
import { Server, Socket } from "socket.io";
import { User } from "../models/User/user.model";
import { Message } from "../models/Message/message.model";
import { RoomAccessService } from "../models/RoomAccess/roomAccess.service";

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

    io.on("connection", async (socket: Socket) => {
        // TODO : it should not send user id when connecting because if user not login it will create error 
        // const userId = socket.handshake.auth?.userId;

        const userId = '68573d20cbe88d8acf355021'

        if (!userId) {
            socket.emit("error", "Authentication required");
            return socket.disconnect();
        }

        const user = await User.findById(userId);

        if (!user) {
            socket.emit("error", "User not found");
            return socket.disconnect();
        }

        const userName = user.name;
        onlineUsers.set(userId, new Set());

        console.log(`User connected: ${userName} (${userId})`);

        // Join Room
        socket.on("join", async ({ roomId }: JoinPayload) => {
            // Check if user has access to room
            const hasAccess = await RoomAccessService.verify(userId, roomId);
            if (!hasAccess) {
                socket.emit("error", "Access denied to room");
                return;
            }

            socket.join(roomId);
            onlineUsers.get(userId)?.add(roomId);

            io.to(roomId).emit("notification", `${userName} joined the room`);

            // Send last 20 messages from DB
            const messages = await Message.find({ roomId })
                .sort({ createdAt: -1 })
                .limit(20);
            socket.emit("chatHistory", messages.reverse());

            io.to(roomId).emit("roomStats", {
                onlineCount: getOnlineUserCount(roomId),
            });
        });

        // Leave Room
        socket.on("leaveRoom", ({ roomId }: JoinPayload) => {
            socket.leave(roomId);
            onlineUsers.get(userId)?.delete(roomId);

            io.to(roomId).emit("notification", `${userName} left the room`);
            io.to(roomId).emit("roomStats", {
                onlineCount: getOnlineUserCount(roomId),
            });
        });

        // Send Message
        socket.on("sendMessage", async ({ roomId, message }: SendMessagePayload) => {
            if (!onlineUsers.get(userId)?.has(roomId)) {
                socket.emit("error", "You must join the room before sending messages");
                return;
            }

            const newMessage = new Message({
                roomId,
                senderId: userId,
                senderName: userName,
                message,
            });

            await newMessage.save();

            io.to(roomId).emit("receiveMessage", {
                senderId: userId,
                senderName: userName,
                message,
            });
        });

        // Disconnect
        socket.on("disconnect", () => {
            console.log(`User disconnected: ${userName} (${userId})`);
            onlineUsers.delete(userId);
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
