import { ChatNotFoundError, MessageNotFoundError } from "../shared/errors/messaging";
import { MessagingRepository } from "./MessagingRepository";

export const MessagingAction = {
    GetChat: "GET_CHAT",
    AddMember: "ADD_MEMBER",
    RemoveMember: "REMOVE_MEMBER",
    UpdateInformation: "UPDATE_INFORMATION",
    SendMessage: "SEND_MESSAGE",
    UploadImage: "UPLOAD_IMAGE",
    GetImage: "GET_IMAGE",
    GetMessages: "GET_MESSAGES",
} as const;

export type MessagingActionType = typeof MessagingAction[keyof typeof MessagingAction];

export class MessagingAuthorizationService {
    constructor(private readonly messages: MessagingRepository) {}

    /**
     * Checks whether an action is allowed
     * @param resourceId The ID of the resource on which the action is operating
     * @param actorId The ID of the user performing the action
     * @param action The action being performed
     * @returns Promise for boolean: true if allowed, false if disallowed
     * @throws Error if the resource does not exist
     */
    public async authorizeAction(resourceId: string, actorId: string, action: MessagingActionType): Promise<boolean> {
        if (
            action === MessagingAction.GetChat ||
            action === MessagingAction.SendMessage ||
            action === MessagingAction.GetImage ||
            action === MessagingAction.GetMessages
        ) {
            const chat = await this.messages.findChatById(resourceId);
            if (!chat) {
                throw new ChatNotFoundError(resourceId);
            }
            return (chat.owner.toString() === actorId) || (!!(chat?.members.some(id => id.toString() === actorId)));
        }
        if (action === MessagingAction.AddMember || action === MessagingAction.RemoveMember || action === MessagingAction.UpdateInformation) {
            const chat = await this.messages.findChatById(resourceId);
            if (!chat) {
                throw new ChatNotFoundError(resourceId);
            }
            return chat.owner.toString() === actorId;
        }
        if (action === MessagingAction.UploadImage) {
            const message = await this.messages.findMessageById(resourceId);
            if (!message) {
                throw new MessageNotFoundError(resourceId);
            }
            return message.sender.toString() === actorId;
        }
        throw new Error(`Action is not valid`);
    }
}
