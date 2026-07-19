import { z } from "zod";
import { zObjectId } from "../../../shared/validators/zObjectId";

export const sendMessageSchema = z.object({
    chatId: zObjectId,
    textContent: z.string().min(2).max(256),
});

export type SendMessageData = z.infer<typeof sendMessageSchema>;

export const getMessagesSchema = z.object({
    chatId: zObjectId,
    limit: z.number().min(1).max(50).optional(),
    cursorDate: z.date().optional(),
    cursorId: zObjectId.optional(),
}).refine(data => {
    const hasCursorDate = !!data.cursorDate;
    const hasCursorId = !!data.cursorId;
    return hasCursorDate === hasCursorId;
}, {
    message: "Both cursorDate and cursorId or neither must be provided",
    path: ["cursorDate", "cursorId"],
});

export type GetMessagesData = z.infer<typeof getMessagesSchema>;
