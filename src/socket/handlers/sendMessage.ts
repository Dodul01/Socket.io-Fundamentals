import { Server, Socket } from "socket.io";
import { Message } from "../../models/Message/message.model";

export const sendMessageHandler = (io: Server, socket: Socket) => async ({ roomId, message }: { roomId: string, message: string }) => {
  if (!roomId || !message) {
    socket.emit("error", "Room ID and message required.");
    return;
  }

  const userId = socket.data.userId;
  const userName = socket.data.userName;

  if (!userId || !userName || !socket.rooms.has(roomId)) {
    socket.emit("error", "You must join the room before sending message.");
    return;
  }

  try {
    // Save to DB
    const msg = await Message.create({
      roomId,
      senderId: userId,
      senderName: userName,
      message,
    });

    io.to(roomId).emit("receiveMessage", msg);
  } catch (err) {
    socket.emit("error", "Failed to send message.");
  }
};
