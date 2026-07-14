import { NextFunction, Request, RequestHandler, Response } from "express";
import { AuthenticationService } from "../../authentication/AuthenticationService";
import { PublicUser } from "../../users/User.types";

declare global {
    namespace Express {
        interface Request {
            // guaranteed to exist if passing authentication
            user?: PublicUser;
            actorId: string;
        }
    }
}

export function authenticate(authenticationService: AuthenticationService): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const header = req.header("Authorization");
            if (!header?.startsWith("Bearer ")) {
                throw new Error("No authentication token provided.");
            }
            const accessToken = header.slice(7);
            const user = await authenticationService.authenticate(accessToken);
            req.user = user;
            req.actorId = user._id.toString();
        }
        catch (err) {
            next(err);
        }
    };
}
