import express from "express";
import { AuthenticationRoutes } from "./routes/AuthenticationRoutes";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import { globalRateLimiter } from "./middleware/rateLimiting";
import { UserRoutes } from "./routes/UserRoutes";
import { notFound } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";
import { MessagingRoutes } from "./routes/MessagingRoutes";

export class ExpressApi {
    private readonly app = express();

    constructor(
        private readonly authenticationRoutes: AuthenticationRoutes,
        private readonly userRoutes: UserRoutes,
        private readonly messagingRoutes: MessagingRoutes,
    ) {
        this.configure();
    }

    private configure() {
        this.app.use(express.json());

        this.app.use(morgan("dev")); // request logger
        this.app.use(cors()); // cors protection
        this.app.use(helmet()); // general HTTP protocol security
        this.app.use(globalRateLimiter());

        this.app.use("/api/v1/authentication", this.authenticationRoutes.router);
        this.app.use("/api/v1/users", this.userRoutes.router);
        this.app.use("/api/v1/messaging", this.messagingRoutes.router);

        this.app.use(notFound());

        this.app.use(errorHandler());
    }

    public getApp(): express.Express {
        return this.app;
    }
}
