import type { Types } from "mongoose";

export interface Chat {
    _id: Types.ObjectId;
    
    title: string;
    createdAt: Date;
    owner: Types.ObjectId;
    members: Types.ObjectId[];
}
