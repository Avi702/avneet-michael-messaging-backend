import { Message } from "../Message.types";

// sender and textContent required, image optional
export type SendMessageDto = Pick<Message, "sender" | "textContent">;
