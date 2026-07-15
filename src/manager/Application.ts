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
    // Would be regular typed but must initialize database before rest of application
    private expressApi: ExpressApi | undefined;
    private liveServer: LiveServer | undefined;
    private httpServer: NodeHttpServer | undefined;

    public async initializeDatabase() {
        if (VARIABLES.env === "production") {
            throw new Error(`Database configuration for production not yet implemented`);
        }
        else if (VARIABLES.env === "development") {
            throw new Error(`Database configuration for development not yet implemented`);
        }
        else {
            const mongo = await MongoMemoryServer.create();
            await mongoose.connect(mongo.getUri());
        }
    }

    public initializeServers() {
        // >>> Database
        // Users
        const userRepository = new UserRepository();
        const userAuthorizationService = new UserAuthorizationService(userRepository);
        const userService = new UserService(userRepository, userAuthorizationService);
        // Authentication
        const passwordService = new PasswordService();
        const jwtService = new JwtService();
        const authenticationService = new AuthenticationService(userRepository, userService, passwordService, jwtService);
        // Messaging
        const messagingRepository = new MessagingRepository();
        const messagingAuthorizationService = new MessagingAuthorizationService(messagingRepository);
        const messagingService = new MessagingService(messagingRepository, messagingAuthorizationService);

        // >>> API helpers
        // Users
        const userController = new UserController(userService);
        const userRoutes = new UserRoutes(userController, authenticationService);
        // Authentication
        const authenticationController = new AuthenticationController(authenticationService);
        const authenticationRoutes = new AuthenticationRoutes(authenticationController, authenticationService);
        // Messaging
        const messagingController = new MessagingController(messagingService);
        const messagingRoutes = new MessagingRoutes(messagingController, authenticationService);

        // Create the Express server
        this.expressApi = new ExpressApi(authenticationRoutes, userRoutes, messagingRoutes);

        // >>> Live helpers
        const connectionManager = new ConnectionManager();
        const chatHandler = new ChatHandler(messagingService);
        const messageHandler = new MessageHandler(messagingService);
        const connectionHandler = new ConnectionHandler(connectionManager, [
            chatHandler,
            messageHandler
        ]);

        // Create the HTTP server
        this.httpServer = createServer(this.expressApi.getApp());

        // Create the Socket.IO server
        this.liveServer = new LiveServer(this.httpServer, authenticationService, connectionHandler);
    }

    public start() {
        // Start the HTTP server
        const port = VARIABLES.port;
        if (!this.httpServer) {
            throw new Error("Must await initializeDatabase and initializeServers before calling start!");
        }
        this.httpServer.listen(port, () => {
            console.log(`Server listening on port ${port}!`);
        });
    }
}