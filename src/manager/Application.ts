import { createServer, Server } from "node:http";
import { AuthenticationController } from "../api/controllers/AuthenticationController";
import { MessagingController } from "../api/controllers/MessagingController";
import { UserController } from "../api/controllers/UserController";
import { ExpressApi } from "../api/ExpressApi";
import { AuthenticationRoutes } from "../api/routes/AuthenticationRoutes";
import { MessagingRoutes } from "../api/routes/MessagingRoutes";
import { UserRoutes } from "../api/routes/UserRoutes";
import { AuthenticationService } from "../authentication/AuthenticationService";
import { JwtService } from "../authentication/JwtService";
import { PasswordService } from "../authentication/PasswordService";
import { ConnectionHandler } from "../live/ConnectionHandler";
import { ConnectionManager } from "../live/ConnectionManager";
import { ChatHandler } from "../live/handlers/ChatHandler";
import { MessageHandler } from "../live/handlers/MessageHandler";
import { LiveServer } from "../live/LiveServer";
import { MessagingAuthorizationService } from "../messaging/MessagingAuthorizationService";
import { MessagingRepository } from "../messaging/MessagingRepository";
import { MessagingService } from "../messaging/MessagingService";
import { UserAuthorizationService } from "../users/UserAuthorizationService";
import { UserRepository } from "../users/UserRepository";
import { UserService } from "../users/UserService";
import { VARIABLES } from "../config/environment";
import { Server as NodeHttpServer } from "node:http";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

export class Application {
    public constructor(
        private readonly expressApi: ExpressApi,
        private readonly liveServer: LiveServer,
        private readonly httpServer: NodeHttpServer,
    ) {}

    /**
     * Starts the HTTP server
     * @param port The port to listen on
     * @returns The port, once listening
     */
    public async start(port: number): Promise<number> {
        if (!this.httpServer) {
            throw new Error("Must await initializeDatabase and initializeServers before calling start!");
        }
        return new Promise<number>((resolve, reject) => {
            this.httpServer.once("error", reject);

            this.httpServer.listen(port, () => {
                this.httpServer.off("error", reject);

                const address = this.httpServer.address();

                if (!address || typeof address === "string") {
                    reject(new Error("Could not determine port"));
                    return;
                }

                resolve(address.port);
            });
        });
    }

    /**
     * Stops the HTTP server
     */
    public stop() {
        this.httpServer.close();
    }
}
