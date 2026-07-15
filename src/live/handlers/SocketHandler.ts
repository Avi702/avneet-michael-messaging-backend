import { Socket } from "socket.io";

export interface SocketHandler {
    register(socket: Socket): void;
}
