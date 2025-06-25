import { Server, Socket } from "socket.io";
import { Message } from "../../models/Message/message.model";

export const sendMessageHandler = (io: Server, socket: Socket) => async ({ roomId, message, receiverId }: { roomId: string, message: string, receiverId: string }) => {
  if (!roomId || !message || !receiverId) {
    socket.emit("error", "Room ID, message and receiverId required.");
    return;
  }

  const senderId = socket.data.userId;
  const senderName = socket.data.userName;

  if (!senderId || !senderName || !socket.rooms.has(roomId)) {
    socket.emit("error", "You must join the room before sending message.");
    return;
  }

  const newMsg = {
    senderId,
    receiverId,
    text: message,
    timestamp: new Date(),
  };

  try {
    // TODO: if the document exsist then update it if not then create a document

    // Update existing room document by pushing the new message
    const updatedRoom = await Message.findOneAndUpdate(
      { roomId },
      { $push: { messages: newMsg } },
      { new: true, upsert: true }
    );

    io.to(roomId).emit("receiveMessage", newMsg);
  } catch (err) {
    socket.emit("error", "Failed to send message.");
  }
};
