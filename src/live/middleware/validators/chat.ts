import { z } from "zod";
import { zObjectId } from "../../../shared/validators/zObjectId";

export const openChatSchema = z.object({
    chatId: zObjectId,
});

export type OpenChatData = z.infer<typeof openChatSchema>;
