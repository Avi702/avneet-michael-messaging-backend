import { z } from "zod";

export const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(8).max(64),
});

export const registerSchema = z.object({
    email: z.email(),
    displayName: z.string().min(3).max(64),
    birthDate: z.iso.date(),
    password: z.string().min(8).max(64),
});

export const authenticateSchema = z.object({
    accessToken: z.jwt(),
});

export const refreshSchema = z.object({
    refreshToken: z.jwt(),
});
