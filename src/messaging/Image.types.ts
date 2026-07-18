import type { Types } from "mongoose";

export interface Image {
    _id: Types.ObjectId;

    uri: string;
    createdAt: Date;
    message: Types.ObjectId;

    // Metadata
    mimeType: string;
    originalName: string,
    size: number;
}
