import { ChatModel } from "./Chat.model";
import { Chat } from "./Chat.types";
import { CreateChatDto } from "./dto/CreateChatDto";
import { UpdateChatInformationDto } from "./dto/UpdateChatInformationDto";
import { SendMessageDto } from "./dto/SendMessageDto";
import { MessageModel } from "./Message.model";
import { Message } from "./Message.types";
import { UploadImageDto } from "./dto/UploadImageDto";
import { Image } from "./Image.types";
import { ImageModel } from "./Image.model";

export class MessagingRepository {
    /**
     * Creates a new chat
     * @param ownerId The ID of the owner of the chat
     * @param data The DTO for creating a chat
     */
    public async createChat(ownerId: string, data: CreateChatDto): Promise<Chat> {
        return await ChatModel.create({ ...data, owner: ownerId });
    }

    /**
     * Finds a chat by ID
     * @param chatId The ID of the chat
     * @returns The Chat if found, else null
     */
    public async findChatById(chatId: string): Promise<Chat | null> {
        return await ChatModel.findOne({ _id: chatId }).lean().exec();
    }

    /**
     * Adds a member to a chat
     * @param chatId The ID of the chat
     * @param userId The ID of the user
     * @returns An updated Chat if found, else null
     * @throws Error if chat not found
     */
    public async addMemberToChat(chatId: string, userId: string): Promise<Chat | null> {
        return await ChatModel.findByIdAndUpdate(
            chatId,
            { $addToSet: { members: userId } },
            { new: true },
        ).lean().exec();
    }

    /**
     * Removes a member from a chat
     * @param chatId The ID of the chat
     * @param userId The ID of the user
     * @returns An updated Chat if found, else null
     * @throws Error if chat not found
     */
    public async removeMemberFromChat(chatId: string, userId: string): Promise<Chat | null> {
        return await ChatModel.findByIdAndUpdate(
            chatId,
            { $pull: { members: userId } },
            { new: true },
        ).lean().exec();
    }

    /**
     * Updates chat information
     * @param chatId The ID of the chat
     * @param data The DTO for updating the chat information
     * @returns The modified Chat if found, otherwise null
     */
    public async updateChatInformation(chatId: string, data: UpdateChatInformationDto): Promise<Chat | null> {
        return await ChatModel.findByIdAndUpdate(chatId, data, { new: true }).lean().exec();
    }

    /**
     * Sends (creates) a message in a chat
     * @param chatId The ID of the chat
     * @param data The DTO for creating a message
     * @returns The created message
     */
    public async sendMessage(chatId: string, data: SendMessageDto): Promise<Message> {
        return await MessageModel.create({
            ...data,
            chat: chatId
        });
    }

    /**
     * Uploads an image to the server
     * @param messageId The ID of the associated message
     * @param data The DTO for uploading an image
     * @returns The created image
     */
    public async uploadImage(messageId: string, data: UploadImageDto): Promise<Image> {
        return await ImageModel.create({
            ...data,
            message: messageId,
        });
    }

    /**
     * Gets an image by ID
     * @param imageId The ID of the image
     * @returns The image, or null if not found
     */
    public async findImageById(imageId: string): Promise<Image | null> {
        return await ImageModel.findOne({ _id: imageId });
    }

    /**
     * Gets paginated messages
     * @param chatId The ID of the chat
     * @param limit The maximum number of messages to return
     * @param cursorDate The date of the last message
     * @param cursorId The ID of the last message seen
     * @throws Error if chat doesn't exist
     * @throws Error if cursor message is invalid
     */
    public async getMessages(chatId: string, limit: number = 50, cursorDate: Date | null = null, cursorId: string | null = null): Promise<Message[]> {
        const query: any = {
            chat: chatId,
        };

        if (cursorDate !== null || cursorId !== null) {
            if (cursorDate === null || cursorId === null) {
                throw new Error(`Cursor message is invalid! Both cursorDate and cursorId or neither should be provided`)
            }

            query.$or = [
                {
                    createdAt: { $lt: cursorDate },
                },
                {
                    createdAt: cursorDate,
                    _id: { $lt: cursorId },
                },
            ];
        }

        return await MessageModel.find(query).sort({
            createdAt: -1,
            _id: -1,
        }).limit(limit).lean();
    }

    /**
     * Finds a message by ID
     * @param messageId The ID of the message
     * @returns The Message if found, else null
     */
    public async findMessageById(messageId: string): Promise<Message | null> {
        return await MessageModel.findOne({ _id: messageId });
    }
}
