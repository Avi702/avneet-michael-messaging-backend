import { z } from "zod";
import { zObjectId } from "./validate";

export const getUserSchema = z.object({
    userId: zObjectId,
});

export const updateProfileSchema = z.object({
    userId: zObjectId,
    displayName: z.string().min(3).max(64),
});
