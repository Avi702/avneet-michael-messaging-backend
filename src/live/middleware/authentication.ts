import { Socket } from "socket.io"
import { AuthenticationService } from "../../authentication/AuthenticationService";

type MiddlewareFunction = ((socket: Socket, next: (err?: Error) => void) => void);

export const authentication = (authenticationService: AuthenticationService): MiddlewareFunction => {
    return async (socket: Socket, next: (err?: Error) => void) => {
        const token = socket.handshake.auth.token as string ?? undefined;
        if (!token) {
            return next(new Error("Authentication error: no token provided"));
        }
        try {
            const user = await authenticationService.authenticate(token);
            socket.data.user = user;
            socket.data.userId = user._id.toString();
            next();
        }
        catch (err) {
            return next(new Error("Token expired or invalid"));
        }
    };
}
