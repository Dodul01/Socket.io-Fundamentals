import { createServer, Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import mongoose from "mongoose";
import app from "./app";
import socketHelper from './helpers/socketHelper';

const PORT = 5000;

// Define the type for the server
let httpServer: HttpServer;
let socketServer: SocketServer;

async function server() {
    try {
        // Connect DB
        await mongoose.connect('mongodb://localhost:27017/chat-app')

        // create HTTP Server
        httpServer = createServer(app);
        const httpPort = PORT;
        const socketPort = 5001;

        // set timeouts
        httpServer.timeout = 120000;
        httpServer.keepAliveTimeout = 5000;
        httpServer.headersTimeout = 60000;

        // Start HTTP Server 
        httpServer.listen(httpPort, () => {
            console.log(`♻️  Application listening on http://localhost:${httpPort}`);
        })

        // set up socket.io server
        socketServer = new SocketServer({
            cors: {
                origin: '*',
                methods: ['GET', 'POST'],
                credentials: true,
            }
        })

        socketHelper.initSocket(socketServer);
        socketServer.listen(socketPort);
        console.log(`♻️  Socket is listening on ws://localhost:${socketPort}`);
    } catch (error) {
        console.log("Failed to start server", error);
        process.exit(1);
    }
}

server();