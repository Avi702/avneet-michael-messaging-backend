import { NextFunction, Request, Response } from "express";
import { AuthenticationService } from "../../authentication/AuthenticationService";
import { asyncHandler } from "./asyncHandler";

export class AuthenticationController {
    constructor(private readonly authenticationService: AuthenticationService) {}

    public login = asyncHandler(async (req: Request, res: Response) => {
        const { email, password } = req.body;
        const result = await this.authenticationService.login(email, password);
        res.json(result);
    });

    public register = asyncHandler(async (req: Request, res: Response) => {
        // Takes DTO, do not extract body (validated by middleware)
        const result = await this.authenticationService.register(req.body);
        res.json(result);
    });

    public authenticate = asyncHandler(async (req: Request, res: Response) => {
        const { accessToken } = req.body;
        const result = await this.authenticationService.authenticate(accessToken);
        res.json(result);
    });

    public refresh = asyncHandler(async (req: Request, res: Response) => {
        const { refreshToken } = req.body;
        const result = await this.authenticationService.refresh(refreshToken);
        res.json(result);
    });

    public updatePassword = asyncHandler(async (req: Request, res: Response) => {
        const { password } = req.body;
        const result = await this.authenticationService.updatePassword(req.actorId, password);
        res.json({
            success: true
        });
    });
}
