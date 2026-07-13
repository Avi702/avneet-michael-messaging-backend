import { model, Schema } from "mongoose";
import { Chat } from "./Chat.types";

const chatSchema = new Schema<Chat>({
    title: {
        type: String,
        required: true,
        default: "Untitled Chat",
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
    owner: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    members: [{
        type: Schema.Types.ObjectId,
        ref: "User",
    }],
});

export const ChatModel = model<Chat>(
    "Chat",
    chatSchema,
);
