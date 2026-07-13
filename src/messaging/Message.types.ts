import type { Types } from "mongoose";

export interface Message {
    _id: Types.ObjectId;

    createdAt: Date;
    chat: Types.ObjectId;
    sender: Types.ObjectId;
    textContent: string;
}
