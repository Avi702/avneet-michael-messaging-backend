import { Chat } from "./Chat.types";
import { CreateChatDto } from "./dto/CreateChatDto";
import { SendMessageDto } from "./dto/SendMessageDto";
import { UpdateChatInformationDto } from "./dto/UpdateChatInformationDto";
import { UploadImageDto } from "./dto/UploadImageDto";
import { Image } from "./Image.types";
import { Message } from "./Message.types";
import { MessagingAction, MessagingAuthorizationService } from "./MessagingAuthorizationService";
import { MessagingRepository } from "./MessagingRepository";

export class MessagingService {
    constructor(private readonly messages: MessagingRepository, private readonly authorization: MessagingAuthorizationService) {}

    /**
     * Creates a new chat
     * @param actorId The ID of the user performing the action
     * @param data The DTO for creating a chat
     */
    public async createChat(actorId: string, data: CreateChatDto): Promise<Chat> {
        return await this.messages.createChat(actorId, data);
    }

    /**
     * Finds a chat by ID
     * @param chatId The ID of the chat
     * @param actorId The ID of the user performing the action
     * @returns Promise for the Chat if found
     * @throws Error if chat does not exist
     * @throws Error if not authorized
     */
    public async getChat(chatId: string, actorId: string): Promise<Chat> {
        if (!(await this.authorization.authorizeAction(chatId, actorId, MessagingAction.GetChat))) {
            throw new Error(`Action not authorized`);
        }
        const chat = await this.messages.findChatById(chatId);
        if (!chat) {
            throw new Error(`Chat ${chatId} does not exist`);
        }
        return chat;
    }

    /**
     * Adds a member to a chat, if allowed
     * @param chatId The ID of the chat
     * @param userId The ID of the user
     * @param actorId The ID of the user performing the action
     * @returns Promise for boolean: true if added, false if already in
     * @throws Error if unable to add the user to this chat
     * @throws Error if not authorized
     */
    public async addMemberToChat(chatId: string, actorId: string, userId: string): Promise<boolean> {
        if (!(await this.authorization.authorizeAction(chatId, actorId, MessagingAction.AddMember))) {
            throw new Error(`Action not authorized`);
        }
        return !!(await this.messages.addMemberToChat(chatId, userId));
    }

    /**
     * Removes a member from a chat, if allowed
     * @param chatId The ID of the chat
     * @param userId The ID of the user
     * @param actorId The ID of the user performing the action
     * @returns Promise for boolean: true if removed, false if already not in chat
     * @throws Error if unable to remove the user from this chat
     * @throws Error if not authorized
     */
    public async removeMemberFromChat(chatId: string, actorId: string, userId: string): Promise<boolean> {
        if (!(await this.authorization.authorizeAction(chatId, actorId, MessagingAction.RemoveMember))) {
            throw new Error(`Action not authorized`);
        }
        return !!(await this.messages.removeMemberFromChat(chatId, userId));
    }

    /**
     * Updates information (the title, for now) about a chat
     * @param chatId The ID of the chat
     * @param actorId The ID of the user performing the action
     * @param data The DTO for updating chat information
     * @throws Error if not authorized
     */
    public async updateChatInformation(chatId: string, actorId: string, data: UpdateChatInformationDto): Promise<void> {
        if (!(await this.authorization.authorizeAction(chatId, actorId, MessagingAction.UpdateInformation))) {
            throw new Error(`Action not authorized`);
        }
        await this.messages.updateChatInformation(chatId, data);
    }

    /**
     * Sends a new message in a chat
     * @param chatId The ID of the chat
     * @param actorId The ID of the user performing the action
     * @param data The DTO for sending a message
     * @returns Promise for the created Message
     * @throws Error if not authorized
     */
    public async sendMessage(chatId: string, actorId: string, data: SendMessageDto): Promise<Message> {
        if (!(await this.authorization.authorizeAction(chatId, actorId, MessagingAction.SendMessage))) {
            throw new Error(`Action not authorized`);
        }
        return await this.messages.sendMessage(chatId, data);
    }

    /**
     * Uploads an image
     * @param messageId The ID of the message with which the image is associated
     * @param actorId The ID of the user performing the action
     * @param data The DTO for uploading an image
     * @returns The Image created
     * @throws Error if not authorized
     */
    public async uploadImage(messageId: string, actorId: string, data: UploadImageDto): Promise<Image> {
        const message = await this.messages.findMessageById(messageId);
        if (!message) {
            throw new Error(`Message ${messageId} does not exist`);
        }
        if (!(await this.authorization.authorizeAction(message.chat.toString(), actorId, MessagingAction.UploadImage))) {
            throw new Error(`Action not authorized`);
        }
        return await this.messages.uploadImage(messageId, data);
    }

    /**
     * Finds an image by ID
     * @param imageId The ID of the image
     * @param actorId The ID of the user performing the action
     * @returns An Image
     * @throws Error if image not found
     * @throws Error if not authorized
     */
    public async getImage(imageId: string, actorId: string): Promise<Image> {
        const image = await this.messages.findImageById(imageId);
        if (!image) {
            throw new Error(`Image not found ${imageId}`);
        }
        const message = await this.messages.findMessageById(image.message.toString());
        if (!message) {
            throw new Error(`Message not found ${image.message}`);
        }
        if (!(await this.authorization.authorizeAction(message.chat._id.toString(), actorId, MessagingAction.GetImage))) {
            throw new Error(`Action not authorized`);
        }
        return image;
    }

    /**
     * Gets paginated messages
     * @param chatId The ID of the chat
     * @param actorId The ID of the user performing the action
     * @param limit The maximum number of messages to return
     * @param cursorDate The date of the last message
     * @param cursorId The ID of the last message seen
     * @throws Error if chat doesn't exist
     * @throws Error if cursor message is invalid
     * @throws Error if not authorized
     */
    public async getMessages(chatId: string, actorId: string, limit: number = 50, cursorDate: Date | null = null, cursorId: string | null = null): Promise<Message[]> {
        if (!(await this.authorization.authorizeAction(chatId, actorId, MessagingAction.GetMessages))) {
            throw new Error(`Action not authorized`);
        }
        return this.messages.getMessages(chatId, limit, cursorDate, cursorId);
    }
}
