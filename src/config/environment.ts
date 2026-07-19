import "dotenv/config";
import { REQUIRED_ENVIRONMENT_VARIABLES } from "./configuration";

// Only crash if we are not mocking the variables
if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "production") {
    REQUIRED_ENVIRONMENT_VARIABLES.forEach(value => {
        if (!process.env[value]) {
            throw new Error(`Missing required environment variable ${value}`);
        }
    });
}

export const VARIABLES = {
    env: process.env.NODE_ENV || "development",
    // Force cast the required variables since the program will crash if they are not strings

    // JWT variables
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET as string,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET as string,
    jwtAccessTokenLifetime: process.env.JWT_ACCESS_TOKEN_LIFETIME as string,
    jwtRefreshTokenLifetime: process.env.JWT_REFRESH_TOKEN_LIFETIME as string,

    // MongoDB
    mongoDbUri: process.env.MONGODB_URI as string,

    // Server configuration
    port: parseInt(process.env.PORT as string) ?? 3000, // Default to port 3000 for listening

    // Image storage
    imageStorageDirectory: process.env.IMAGE_STORAGE_DIRECTORY, // Where the images go
};
