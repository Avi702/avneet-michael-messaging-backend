import { Socket } from "socket.io";

export class ConnectionManager {
    private readonly socketsByUser = new Map<string, Set<Socket>>();
    private readonly userBySocketId = new Map<string, string>();

    /**
     * Registers a user's connection
     * @param socket The socket
     */
    public connect(socket: Socket): void {
        if (this.userBySocketId.has(socket.id)) {
            return;
        }
        
        const userId = socket.data.userId;
        let sockets = this.socketsByUser.get(userId);

        if (!sockets) {
            sockets = new Set();
            this.socketsByUser.set(userId, sockets);
        }

        sockets.add(socket);
        this.userBySocketId.set(socket.id, userId);
    }

    /**
     * Unregisters a user's connection
     * @param socket The socket
     */
    public disconnect(socket: Socket): void {
        const userId = this.userBySocketId.get(socket.id);
        if (userId === undefined) {
            return;
        }
        const sockets = this.socketsByUser.get(userId);
        if (sockets) {
            sockets.delete(socket);
            if (sockets.size === 0) {
                this.socketsByUser.delete(userId);
            }
        }
        this.userBySocketId.delete(socket.id);
    }

    /**
     * Sockets associated with a user
     * @param userId The ID of the user
     * @returns The sockets associated with that user
     */
    public getSockets(userId: string): readonly Socket[] {
        return [...(this.socketsByUser.get(userId) ?? [])]
    }

    /**
     * Checks whether a user is connected
     * @param userId The ID of the user
     * @returns Whether the user is connected
     */
    public isOnline(userId: string): boolean {
        return this.socketsByUser.has(userId);
    }

    /**
     * Gets a user's ID from a socket
     * @param socket The socket
     * @returns The user ID or undefined if not found
     */
    public getUserId(socket: Socket): string | undefined {
        return this.userBySocketId.get(socket.id);
    }
}
