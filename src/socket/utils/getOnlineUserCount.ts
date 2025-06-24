import { Server } from "socket.io";

// FIXME: The `adapter` gives access to Socket.IO's internal room-socket map, allowing you to get the number of sockets (users) in a specific room.
export const getOnlineUserCount = (io: Server, roomId: string): number => {
    const room = io.sockets.adapter.rooms.get(roomId);
    return room ? room.size : 0;
};
