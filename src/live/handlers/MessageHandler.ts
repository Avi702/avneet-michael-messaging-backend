import { Socket } from "socket.io";
import { MessagingService } from "../../messaging/MessagingService";
import { SocketHandler } from "./SocketHandler";
import { validate } from "../middleware/validators/validate";
import { GetMessagesData, getMessagesSchema, SendMessageData, sendMessageSchema } from "../middleware/validators/message";

export class MessageHandler implements SocketHandler {
    constructor(
        private readonly messagingService: MessagingService,
    ) {}

    public register(socket: Socket): void {
        socket.on("message:send", (data) => this.handleSendMessage(socket, data));
        socket.on("message:get", (data) => this.handleGetMessages(socket, data));
    }

    private async handleSendMessage(socket: Socket, unparsedData: any): Promise<void> {
        try {
            const data = validate<SendMessageData>(sendMessageSchema, unparsedData);
            if (!data) {
                socket.emit("reply:message:send", {
                    success: false,
                    note: "invalid format of input arguments provided",
                });
                return;
            }
            const message = await this.messagingService.sendMessage(data.chatId, socket.data.userId, data);
            socket.join(data.chatId);
            socket.to(data.chatId).emit("")
            socket.emit("reply:message:send", {
                success: true,
                note: "success",
                message: message,
            });
        }
        catch (err) {
            socket.emit("reply:message:send", {
                success: false,
                note: "error during message sending",
            });
        }
    }

    private async handleGetMessages(socket: Socket, unparsedData: any): Promise<void> {
        try {
            const data = validate<GetMessagesData>(getMessagesSchema, unparsedData);
            if (!data) {
                socket.emit("reply:message:get", {
                    success: false,
                    note: "invalid format of input arguments provided",
                });
                return;
            }
            const messages = await this.messagingService.getMessages(data.chatId, socket.data.userId, data.limit, data.cursorDate, data.cursorId);
            socket.emit("reply:message:get", {
                success: true,
                note: "success",
                messages: messages
            });
        }
        catch (err) {
            socket.emit("reply:message:get", {
                success: false,
                note: "error during message sending",
            });
        }
    }
}
