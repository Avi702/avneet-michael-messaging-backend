import { NextFunction, Request, RequestHandler, Response } from "express";
import { AuthenticationService } from "../../authentication/AuthenticationService";
import { PrivateUser } from "../../users/User.types";
import { UnauthorizedError } from "../../shared/errors/common";

declare global {
    namespace Express {
        interface Request {
            // guaranteed to exist if passing authentication
            user?: PrivateUser;
            actorId: string;
        }
    }
}

export function authenticate(authenticationService: AuthenticationService): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const header = req.header("Authorization");
            if (!header || !header.startsWith("Bearer ")) {
                throw new UnauthorizedError("No authentication token provided.")
            }
            const accessToken = header.slice(7);
            const user = await authenticationService.authenticate(accessToken);
            req.user = user;
            req.actorId = user._id.toString();

            next();
        }
        catch (err) {
            next(err);
        }
    };
}
