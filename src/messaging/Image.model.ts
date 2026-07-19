import { model, Schema } from "mongoose";
import { Image } from "./Image.types";

const imageSchema = new Schema<Image>({
    uri: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
    message: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Message",
    },
    mimeType: {
        type: String,
        required: true,
    },
    originalName: {
        type: String,
        required: true,
    },
    size: {
        type: Number,
        required: true,
    },
});

export const ImageModel = model<Image>(
    "Image",
    imageSchema,
);
