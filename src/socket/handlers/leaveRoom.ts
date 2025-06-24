import { Server, Socket } from "socket.io";
import onlineUsers from "../onlineUsers";
import { getOnlineUserCount } from "../utils/getOnlineUserCount";

export const leaveRoomHandler = (io: Server, socket: Socket) => ({roomId}:{roomId: string})=> {
    const userId = socket.data.userId;
    const userName = socket.data.userName;

    // if no user or not online return from her
    if(!userId || !onlineUsers.get(userId)) return;


    socket.leave(roomId)
    onlineUsers.get(userId)!.delete(roomId);

    io.to(roomId).emit('notification', `${userName} left the room.`);
    io.to(roomId).emit('roomStats',{
        onlineCount: getOnlineUserCount(io, roomId),
    })
}