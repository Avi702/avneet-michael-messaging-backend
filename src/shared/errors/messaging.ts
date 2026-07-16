import { NotFoundError } from "./common";

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
