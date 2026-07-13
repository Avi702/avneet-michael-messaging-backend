import { model, Schema } from "mongoose";
import { type User } from "./User.types";

const userSchema = new Schema<User>({
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
    birthDate: {
        type: String,
        required: true,
    },
    displayName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    lastOnline: {
        type: Date,
        required: true,
        default: Date.now,
    },
    isOnline: {
        type: Boolean,
        required: true,
        default: true,
    },
});

export const UserModel = model<User>(
    "User",
    userSchema,
);
