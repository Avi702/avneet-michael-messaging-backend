import jwt from "jsonwebtoken";
import { VARIABLES as ENVIRONMENT_VARIABLES } from "../config/environment";

export interface TokenPayload {
    sub: string; // userId
}

export class JwtService {
    // Generation secrets
    private readonly accessSecret: string = ENVIRONMENT_VARIABLES.jwtAccessSecret;
    private readonly refreshSecret: string = ENVIRONMENT_VARIABLES.jwtRefreshSecret;

    private readonly serviceParameters = {
        issuer: "https://github.com/michaelrothkopf/messaging-application-u26-backend",
        audience: "https://github.com/Avi702/messaging-application-frontend",
    };

    /**
     * Generates an access token
     * @param payload The information to be encoded in the token
     * @returns The access token as a string
     */
    public generateAccessToken(payload: TokenPayload): string {
        return jwt.sign({ ...payload }, this.accessSecret, {
            expiresIn: ENVIRONMENT_VARIABLES.jwtAccessTokenLifetime as any, // must cast because expects literal type
            ...this.serviceParameters,
        });
    }

    /**
     * Generates a refresh token
     * @param payload The information to be encoded in the token
     * @returns The refresh token as a string
     */
    public generateRefreshToken(payload: TokenPayload): string {
        return jwt.sign({ ...payload }, this.refreshSecret, {
            expiresIn: ENVIRONMENT_VARIABLES.jwtRefreshTokenLifetime as any,
            ...this.serviceParameters,
        });
    }

    /**
     * Verifies an access token
     * @param token The token from a client
     * @returns The TokenPayload containing their verified information
     * @throws If token is invalid
     */
    public verifyAccessToken(token: string): TokenPayload {
        return jwt.verify(token, this.accessSecret, this.serviceParameters) as TokenPayload;
    }

    /**
     * Verifies a refresh token
     * @param token The token from a client
     * @returns The TokenPayload containing their verified information
     * @throws If token is invalid
     */
    public verifyRefreshToken(token: string): TokenPayload {
        return jwt.verify(token, this.refreshSecret, this.serviceParameters) as TokenPayload;
    }
}
