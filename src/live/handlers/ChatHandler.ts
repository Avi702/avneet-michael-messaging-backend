import { Socket } from "socket.io";
import { MessagingService } from "../../messaging/MessagingService";
import { SocketHandler } from "./SocketHandler";
import { OpenChatData, openChatSchema } from "../middleware/validators/chat";
import { validate } from "../middleware/validators/validate";
import { getTokenSourceMapRange } from "typescript";

export class ChatHandler implements SocketHandler {
    constructor(
        private readonly messagingService: MessagingService,
    ) {}

    public register(socket: Socket): void {
        socket.on("chat:open", (data) => this.openChat(socket, data));
        socket.on("chat:close", () => this.closeChat(socket));
    }

    private async openChat(socket: Socket, unparsedData: any): Promise<void> {
        try {
            const data = validate<OpenChatData>(openChatSchema, unparsedData);
            if (!data) {
                socket.emit("reply:chat:open", {
                    success: false,
                    note: "invalid format of input arguments provided",
                });
                return;
            }
            const chat = await this.messagingService.getChat(data.chatId, socket.data.userId);
            // Leave other chat rooms
            for (const room of socket.rooms) {
                socket.leave(room);
            }
            socket.join(chat._id.toString());
            socket.emit("reply:chat:open", {
                success: true,
                note: "joined chat",
            });
        }
        catch (err) {
            socket.emit("reply:chat:open", {
                success: false,
                note: "error opening chat; could be unauthenticated or chat does not exist"
            });
        }
    }

    private async closeChat(socket: Socket): Promise<void> {
        // Socket is only supposed to be in one chat room at a time, so closing any chat should just leave all the rooms
        for (const room of socket.rooms) {
            socket.leave(room);
        }
        socket.emit("reply:chat:close", {
            success: true,
            note: "closed chat"
        });
    }
}
