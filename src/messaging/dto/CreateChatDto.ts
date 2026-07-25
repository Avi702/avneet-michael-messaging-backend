import { Chat } from "../Chat.types";

export type CreateChatDto = Partial<Pick<Chat, "title">> & Pick<Chat, "members">;
