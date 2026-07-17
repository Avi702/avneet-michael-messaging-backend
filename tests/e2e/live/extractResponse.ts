import { Socket } from "socket.io-client";

/**
 * Creates an easily awaitable, single-use handler for a socket
 * @param socket The socket
 * @param eventName The name of the event
 * @param timeoutMs The number of milliseconds to wait before giving up. Default 5000
 * @returns A promise to what the server sent with that event name
 */
export function extractResponse(socket: Socket, eventName: string, timeoutMs: number = 5000): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        const timeout = setTimeout(() => { reject() }, timeoutMs);

        socket.once(eventName, (res) => {
            clearTimeout(timeout);
            resolve(res);
        });
    });
}
