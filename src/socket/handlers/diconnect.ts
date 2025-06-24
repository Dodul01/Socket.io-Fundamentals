import { Server, Socket } from "socket.io";
import onlineUsers from "../onlineUsers";

export const disconnectHandler = (_io: Server, socket: Socket) => () =>{
    const userId = socket.data.userId;

    if(userId){
        console.log(`User disconnected: ${userId}`);
        onlineUsers.delete(userId);
    }
}