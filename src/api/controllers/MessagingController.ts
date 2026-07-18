import { Request, Response } from "express";
import { MessagingService } from "../../messaging/MessagingService";
import { asyncHandler } from "./asyncHandler";
import { BadRequestError } from "../../shared/errors/common";

export class MessagingController {
    constructor(private readonly messagingService: MessagingService) {}

    public createChat = asyncHandler(async (req: Request, res: Response) => {
        const response = await this.messagingService.createChat(req.actorId, req.body);
        res.json(response);
    });

    public getChat = asyncHandler(async (req: Request, res: Response) => {
        const { chatId } = req.body;
        const response = await this.messagingService.getChat(chatId, req.actorId);
        res.json(response);
    });

    public addMemberToChat = asyncHandler(async (req: Request, res: Response) => {
        const { chatId, userId } = req.body;
        const response = await this.messagingService.addMemberToChat(chatId, req.actorId, userId);
        res.json({ success: response });
    });

    public removeMemberFromChat = asyncHandler(async (req: Request, res: Response) => {
        const { chatId, userId } = req.body;
        const response = await this.messagingService.removeMemberFromChat(chatId, req.actorId, userId);
        res.json({ success: response });
    });

    public updateChatInformation = asyncHandler(async (req: Request, res: Response) => {
        const { chatId } = req.body;
        await this.messagingService.updateChatInformation(chatId, req.actorId, req.body);
        res.json({ success: true });
    });

    // Note on absence of sendMessage: only available via WS

    public uploadImage = asyncHandler(async (req: Request, res: Response) => {
        const { messageId } = req.body;
        const file = req.file;

        if (!file) {
            throw new BadRequestError("File required for image upload");
        }

        const image = await this.messagingService.uploadImage(messageId, req.actorId, req.body);
        res.json(image);
    });

    public getImage = asyncHandler(async (req: Request, res: Response) => {
        const { imageId } = req.body;
        const image = await this.messagingService.getImage(imageId, req.actorId);
        res.json(image);
    });

    // Note on absence of getMessages: only available via WS
}
