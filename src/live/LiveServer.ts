import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { AuthenticationService } from "../authentication/AuthenticationService";
import { authentication } from "./middleware/authentication";
import { PublicUser } from "../users/User.types";
import { ConnectionHandler } from "./ConnectionHandler";

export class LiveServer {
    private readonly io;

    constructor(
        httpServer: HttpServer,
        private readonly authenticationService: AuthenticationService,
        private readonly connectionHandler: ConnectionHandler,
    ) {
        this.io = new Server(httpServer, {
            cors: {
                origin: "*",
            },
        });
        this.configure();
    }

    private configure() {
        this.io.use(authentication(this.authenticationService));

        this.io.on("connection", this.connectionHandler.handleConnection);
    }
}
