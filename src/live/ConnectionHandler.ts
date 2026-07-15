import { Socket } from "socket.io";
import { ConnectionManager } from "./ConnectionManager";
import { SocketHandler } from "./handlers/SocketHandler";

export class ConnectionHandler {
    constructor(
        private readonly connectionManager: ConnectionManager,
        private readonly handlers: SocketHandler[]
    ) {}

    public handleConnection = (socket: Socket): void => {
        this.connectionManager.connect(socket);

        for (const handler of this.handlers) {
            handler.register(socket);
        }
        
        socket.on("disconnect", () => {
            this.connectionManager.disconnect(socket);
        });
    }
}
