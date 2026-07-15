import mongoose from "mongoose";
import { z } from "zod";

export const zObjectId = z.string().refine(
    value => mongoose.Types.ObjectId.isValid(value),
    { message: "Invalid MongoDB object" },
);
