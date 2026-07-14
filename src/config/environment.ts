import "dotenv/config";
import { REQUIRED_ENVIRONMENT_VARIABLES } from "./configuration";

REQUIRED_ENVIRONMENT_VARIABLES.forEach(value => {
    if (!process.env[value]) {
        throw new Error(`Missing required environment variable ${value}`);
    }
});

export const VARIABLES = {
    env: process.env.NODE_ENV || "development",
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
};
