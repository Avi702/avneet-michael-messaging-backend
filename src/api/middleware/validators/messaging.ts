import { z } from "zod";
import { zObjectId } from "../../../shared/validators/zObjectId";

export const createChatSchema = z.object({
    title: z.string().min(3).max(64),
});

export const getChatSchema = z.object({
    chatId: zObjectId,
});

export const addMemberToChatSchema = z.object({
    chatId: zObjectId,
    userId: zObjectId,
});

export const removeMemberFromChatSchema = z.object({
    chatId: zObjectId,
    userId: zObjectId,
});

export const updateChatInformationSchema = z.object({
    chatId: zObjectId,
    title: z.string().min(3).max(64),
});

export const uploadImageSchema = z.object({
    messageId: zObjectId,
});

export const getImageSchema = z.object({
    imageId: zObjectId,
});
