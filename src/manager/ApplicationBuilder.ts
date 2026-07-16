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
import { Application } from "./Application";
import { HealthRoutes } from "../api/routes/HealthRoutes";

export class ApplicationBuilder {
    /**
     * Builds a new application
     * 
     * Precondition: database initialized
     * @returns A new Application instance
     */
    public buildApplication(): Application {
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
        // Health
        const healthRoutes = new HealthRoutes();

        // Create the Express server
        const expressApi = new ExpressApi(authenticationRoutes, userRoutes, messagingRoutes, healthRoutes);

        // >>> Live helpers
        const connectionManager = new ConnectionManager();
        const chatHandler = new ChatHandler(messagingService);
        const messageHandler = new MessageHandler(messagingService);
        const connectionHandler = new ConnectionHandler(connectionManager, [
            chatHandler,
            messageHandler
        ]);

        // Create the HTTP server
        const httpServer = createServer(expressApi.getApp());

        // Create the Socket.IO server
        const liveServer = new LiveServer(httpServer, authenticationService, connectionHandler);

        return new Application(expressApi, liveServer, httpServer);
    }
}
