import { UnauthorizedError } from "../shared/errors/common";
import { ChatNotFoundError, ImageNotFoundError, MessageNotFoundError, UserAlreadyInChatError, UserNotInChatError, UserOwnsChatError } from "../shared/errors/messaging";
import { UserNotFoundError } from "../shared/errors/users";
import { UserRepository } from "../users/UserRepository";
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
    constructor(
        private readonly messages: MessagingRepository,
        private readonly authorization: MessagingAuthorizationService,
        private readonly users: UserRepository,
    ) {}

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
     * @throws ChatNotFoundError if chat does not exist
     * @throws UnauthorizedError if not authorized
     */
    public async getChat(chatId: string, actorId: string): Promise<Chat> {
        if (!(await this.authorization.authorizeAction(chatId, actorId, MessagingAction.GetChat))) {
            throw new UnauthorizedError(`User is not permitted to perform this action`);
        }
        const chat = await this.messages.findChatById(chatId);
        if (!chat) {
            throw new ChatNotFoundError(chatId);
        }
        return chat;
    }

    /**
     * Adds a member to a chat, if allowed
     * @param chatId The ID of the chat
     * @param userId The ID of the user
     * @param actorId The ID of the user performing the action
     * @returns Promise for boolean: true if added, false if already in
     * @throws UnauthorizedError if not permitted (actor is not owner of chat)
     * @throws UserNotFoundError if the user to be added does not exist
     * @throws ChatNotFoundError if the chat to be added to does not exist
     * @throws UserOwnsChatError if the owner attempts to add themselves
     * @throws UserAlreadyInChatError if the user to be added is already in the chat
     */
    public async addMemberToChat(chatId: string, actorId: string, userId: string): Promise<boolean> {
        if (!(await this.authorization.authorizeAction(chatId, actorId, MessagingAction.AddMember))) {
            throw new UnauthorizedError(`User is not permitted to perform this action`);
        }
        const user = await this.users.findById(userId);
        if (!user) {
            throw new UserNotFoundError(userId);
        }
        const chat = await this.messages.findChatById(chatId);
        if (!chat) {
            throw new ChatNotFoundError(chatId);
        }
        if (chat.owner.toString() === userId) {
            throw new UserOwnsChatError(userId, chatId);
        }
        if (chat.members.some(memberId => memberId.toString() === userId)) {
            throw new UserAlreadyInChatError(userId, chatId);
        }
        return !!(await this.messages.addMemberToChat(chatId, userId));
    }

    /**
     * Removes a member from a chat, if allowed
     * @param chatId The ID of the chat
     * @param userId The ID of the user
     * @param actorId The ID of the user performing the action
     * @returns Promise for boolean: true if removed, false if already not in chat
     * @throws UnauthorizedError if not permitted (actor is not owner of chat)
     * @throws UserNotFoundError if the user to be removed does not exist
     * @throws ChatNotFoundError if the chat to be removed from does not exist
     * @throws UserOwnsChatError if the owner attempts to remove themselves
     * @throws UserNotInChatError if the user to be removed is not in the chat
     */
    public async removeMemberFromChat(chatId: string, actorId: string, userId: string): Promise<boolean> {
        if (!(await this.authorization.authorizeAction(chatId, actorId, MessagingAction.RemoveMember))) {
            throw new UnauthorizedError(`User is not permitted to perform this action`);
        }
        const user = await this.users.findById(userId);
        if (!user) {
            throw new UserNotFoundError(userId);
        }
        const chat = await this.messages.findChatById(chatId);
        if (!chat) {
            throw new ChatNotFoundError(chatId);
        }
        if (chat.owner.toString() === userId) {
            throw new UserOwnsChatError(userId, chatId);
        }
        if (!(chat.members.some(memberId => memberId.toString() === userId))) {
            throw new UserNotInChatError(userId, chatId);
        }
        return !!(await this.messages.removeMemberFromChat(chatId, userId));
    }

    /**
     * Updates information (the title, for now) about a chat
     * @param chatId The ID of the chat
     * @param actorId The ID of the user performing the action
     * @param data The DTO for updating chat information
     * @throws UnauthorizedError if the user is not the owner of the chat
     */
    public async updateChatInformation(chatId: string, actorId: string, data: UpdateChatInformationDto): Promise<void> {
        if (!(await this.authorization.authorizeAction(chatId, actorId, MessagingAction.UpdateInformation))) {
            throw new UnauthorizedError(`User is not permitted to perform this action`);
        }
        await this.messages.updateChatInformation(chatId, data);
    }

    /**
     * Sends a new message in a chat
     * @param chatId The ID of the chat
     * @param actorId The ID of the user performing the action
     * @param data The DTO for sending a message
     * @returns Promise for the created Message
     * @throws ChatNotFoundError if the chat does not exist
     * @throws UnauthorizedError if the user is not a member of the chat
     */
    public async sendMessage(chatId: string, actorId: string, data: SendMessageDto): Promise<Message> {
        if (!(await this.authorization.authorizeAction(chatId, actorId, MessagingAction.SendMessage))) {
            throw new UnauthorizedError(`User is not permitted to perform this action`);
        }
        return await this.messages.sendMessage(chatId, actorId, data);
    }

    /**
     * Uploads an image
     * @param messageId The ID of the message with which the image is associated
     * @param actorId The ID of the user performing the action
     * @param data The DTO for uploading an image
     * @returns The Image created
     * @throws UnauthorizedError if the user is not the sender of the message the image should be attached to
     * @throws MessageNotFoundError if the message to be attached to does not exist
     */
    public async uploadImage(messageId: string, actorId: string, data: UploadImageDto): Promise<Image> {
        // No need to check, authorizeAction has to check and will throw MessageNotFoundError
        // const message = await this.messages.findMessageById(messageId);
        // if (!message) {
        //     throw new MessageNotFoundError(messageId);
        // }
        if (!(await this.authorization.authorizeAction(messageId, actorId, MessagingAction.UploadImage))) {
            throw new UnauthorizedError(`User is not permitted to perform this action`);
        }
        return await this.messages.uploadImage(messageId, data);
    }

    /**
     * Finds an image by ID
     * @param imageId The ID of the image
     * @param actorId The ID of the user performing the action
     * @returns An Image
     * @throws ImageNotFoundError if the image to retrieve does not exist
     * @throws MessageNotFoundError if the message associated with the image does not exist
     * @throws UnauthorizedError if the user is not in the chat associated with the message associated with the image
     */
    public async getImage(imageId: string, actorId: string): Promise<Image> {
        const image = await this.messages.findImageById(imageId);
        if (!image) {
            throw new ImageNotFoundError(imageId);
        }
        const message = await this.messages.findMessageById(image.message.toString());
        if (!message) {
            throw new MessageNotFoundError(image.message.toString());
        }
        if (!(await this.authorization.authorizeAction(message.chat._id.toString(), actorId, MessagingAction.GetImage))) {
            throw new UnauthorizedError(`User is not permitted to perform this action`);
        }
        return image;
    }

    /**
     * Gets cursor paginated messages
     * 
     * Use cursorDate and cursorId to specify the last known message
     * 
     * Both cursorDate and cursorId or neither must be supplied; BadRequestError thrown if condition violated
     * 
     * @param chatId The ID of the chat
     * @param actorId The ID of the user performing the action
     * @param limit The maximum number of messages to return
     * @param cursorDate The date of the last message seen
     * @param cursorId The ID of the last message seen
     * @throws ChatNotFoundError if chat doesn't exist
     * @throws UnauthorizedError if the user is not in the chat
     * @throws BadRequestError if cursorDate and cursorId are provided sparingly
     */
    public async getMessages(chatId: string, actorId: string, limit: number = 50, cursorDate: Date | null = null, cursorId: string | null = null): Promise<Message[]> {
        if (!(await this.authorization.authorizeAction(chatId, actorId, MessagingAction.GetMessages))) {
            throw new UnauthorizedError(`User is not permitted to perform this action`);
        }
        return this.messages.getMessages(chatId, limit, cursorDate, cursorId);
    }
}
