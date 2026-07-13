import { model, Schema } from "mongoose";
import { Message } from "./Message.types";

const messageSchema = new Schema<Message>({
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
    chat: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Chat",
    },
    sender: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    textContent: {
        type: String,
        required: true,
    },
});

export const MessageModel = model<Message>(
    "Message",
    messageSchema,
);
