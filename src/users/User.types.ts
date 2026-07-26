import type { Types } from "mongoose";

export interface User {
    _id: Types.ObjectId;
    createdAt: Date;
    birthDate: string;
    displayName: string;
    bio: string;
    email: string;
    password: string;
    lastOnline: Date;
    isOnline: boolean;
}

export type PublicUser = Pick<User, "_id" | "createdAt" | "displayName" | "bio" | "lastOnline" | "isOnline">;

export type PrivateUser = PublicUser & Pick<User, "email" | "birthDate">;
