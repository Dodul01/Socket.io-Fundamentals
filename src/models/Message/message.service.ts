import { Message } from "./message.model";

export async function saveMessage(data: {
  roomId: string;
  senderId: string;
  receiverId: string;
  text: string;
}){
  const existingRoom = await Message.findOne({ roomId: data.roomId });
  console.log("from the saveMessage function:", data);

  const message = {
    senderId: data.senderId,
    receiverId: data.receiverId,
    text: data.text,
    timestamp: new Date(),
  };

  if (existingRoom) {
    await Message.updateOne(
      { roomId: data.roomId },
      { $push: { messages: message } }
    );
  } else {
    await Message.create({
      roomId: data.roomId,
      messages: [message],
    });
  }
}

export async function getMessages(roomId: string, limit = 20) {
  const room = await Message.findOne({ roomId });
  return room?.messages.slice(-limit) || [];
}


export const MessageService = {
  saveMessage,
  getMessages,
}