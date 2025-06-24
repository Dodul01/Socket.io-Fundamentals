import { Server, Socket } from "socket.io";
import { joinRoomHandler } from "../socket/handlers/joinRoom";
import { sendMessageHandler } from "../socket/handlers/sendMessage";
import { leaveRoomHandler } from "../socket/handlers/leaveRoom";
import { disconnectHandler } from "../socket/handlers/diconnect";

let io : Server;

export const initSocket = ( server: Server ) =>{
    io = server

    io.on('connection', (socket: Socket)=>{
        console.log("Socket connected  succesfully.", socket.id);
        
        socket.on('join', joinRoomHandler(io, socket));
        socket.on('sendMessage', sendMessageHandler(io, socket));
        socket.on('leaveRoom', leaveRoomHandler(io, socket));
        socket.on('disconnect', disconnectHandler(io, socket));
    });
};

export const getIO = () : Server => {
    if(!io) throw new Error('Socket.io not intialized');
    return io;
}

const socketHelper = {
    initSocket,
    getIO
}

export default socketHelper;