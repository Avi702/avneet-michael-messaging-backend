import { z } from "zod";
import { zObjectId } from "../../../shared/validators/zObjectId";

export const getUserByIdSchema = z.object({
    userId: zObjectId,
});

export const getUserByEmailSchema = z.object({
    email: z.email(),
});

export const updateProfileSchema = z.object({
    displayName: z.string().min(3).max(64),
    bio: z.string().max(256).optional(),
});
