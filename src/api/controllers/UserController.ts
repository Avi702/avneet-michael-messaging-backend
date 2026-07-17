import { Request, Response } from "express";
import { UserService } from "../../users/UserService";
import { asyncHandler } from "./asyncHandler";

export class UserController {
    constructor(private readonly userService: UserService) {}

    public getUserById = asyncHandler(async (req: Request, res: Response) => {
        const { userId } = req.body;
        const result = await this.userService.getUserById(userId, req.actorId);
        res.json(result);
    });

    public getUserByEmail = asyncHandler(async (req: Request, res: Response) => {
        const { email } = req.body;
        const result = await this.userService.getUserByEmail(email, req.actorId);
        res.json(result);;
    });

    public updateProfile = asyncHandler(async (req: Request, res: Response) => {
        await this.userService.updateProfile(req.actorId, req.body);
        res.status(200).json({ success: true });
    });
}
