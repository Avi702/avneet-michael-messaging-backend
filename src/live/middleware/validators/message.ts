import { z } from "zod";
import { zObjectId } from "../../../shared/validators/zObjectId";

export const sendMessageSchema = z.object({
    chatId: zObjectId,
    textContent: z.string().min(2).max(256),
});

export type SendMessageData = z.infer<typeof sendMessageSchema>;

export const getMessagesSchema = z.object({
    chatId: zObjectId,
    limit: z.number().min(1).max(50),
    cursorDate: z.date(),
    cursorId: zObjectId,
});

export type GetMessagesData = z.infer<typeof getMessagesSchema>;
