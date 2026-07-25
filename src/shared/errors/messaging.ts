import { ConflictError, NotFoundError } from "./common";

export class ChatNotFoundError extends NotFoundError {
    constructor(identifier: string) {
        super(`Chat ${identifier} does not exist`);
        this.code = "CHAT_NOT_FOUND";
    }
}

export class MessageNotFoundError extends NotFoundError {
    constructor(identifier: string) {
        super(`Message ${identifier} does not exist`);
        this.code = "MESSAGE_NOT_FOUND";
    }
}

export class ImageNotFoundError extends NotFoundError {
    constructor(identifier: string) {
        super(`Image ${identifier} does not exist`);
        this.code = "IMAGE_NOT_FOUND";
    }
}

export class UserAlreadyInChatError extends ConflictError {
    constructor(userId: string, chatId: string) {
        super(`User ${userId} is already in chat ${chatId}`);
        this.code = "USER_ALREADY_IN_CHAT";
    }
}

export class UserNotInChatError extends NotFoundError {
    constructor(userId: string, chatId: string) {
        super(`User ${userId} is not in chat ${chatId}`);
        this.code = "USER_NOT_IN_CHAT";
    }
}

export class UserOwnsChatError extends ConflictError {
    constructor(userId: string, chatId: string) {
        super(`User ${userId} owns chat ${chatId}`);
        this.code = "USER_OWNS_CHAT";
    }
}

export class ChatAlreadyExistsError extends ConflictError {
    constructor(chatId: string) {
        super(`A chat with the same members already exists: ${chatId}`);
        this.code = "CHAT_ALREADY_EXISTS";
    }
}
