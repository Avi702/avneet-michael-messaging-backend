import { CreateUserDto } from "../users/dto/CreateUserDto";
import { PublicUser, User } from "../users/User.types";
import { UserRepository } from "../users/UserRepository";
import { UserService } from "../users/UserService";
import { JwtService, TokenPayload } from "./JwtService";
import { PasswordService } from "./PasswordService";

export interface LoginResult {
    accessToken: string;
    refreshToken: string;
    user: PublicUser;
}

export interface RefreshResult {
    accessToken: string;
    refreshToken: string;
}

export class AuthenticationService {
    constructor(
        private readonly users: UserRepository,
        private readonly userService: UserService,
        private readonly passwordService: PasswordService,
        private readonly jwtService: JwtService
    ) {}

    /**
     * Logs in a user
     * @param email The user's email
     * @param password The user's password in plaintext
     * @returns The resulting tokens and user data
     * @throws If the user does not exist
     * @throws If the password is invalid
     */
    public async login(email: string, password: string): Promise<LoginResult> {
        // Ensure the user exists
        const user = await this.users.findByEmail(email);
        if (!user) {
            throw new Error(`User with email ${email} not found`);
        }

        // Validate the password
        const validPassword = await this.passwordService.compare(password, user.password);
        if (!validPassword) {
            throw new Error(`Password incorrect`);
        }

        // Make the tokens
        const payload: TokenPayload = {
            sub: user._id.toString(),
        };

        return {
            accessToken: this.jwtService.generateAccessToken(payload),
            refreshToken: this.jwtService.generateRefreshToken(payload),
            user: this.users.publicizeUser(user),
        };
    }

    /**
     * Registers a new user
     * @param data The DTO for creating a user
     * @returns The created user
     * @throws If user is not at least UserService.MINIMUM_AGE years old
     * @throws If user already exists with that email
     */
    public async register(data: CreateUserDto): Promise<PublicUser> {
        // Hash the password
        const hashedData = {
            ...data,
            password: await this.passwordService.hash(data.password),
        };
        // Create the user
        const user = await this.userService.createUser(hashedData);
        return user;
    }

    /**
     * Authenticates a user using their access token
     * @param accessToken The access token string from the client
     * @returns The user, if authenticated
     * @throws If the access token is invalid
     * @throws If the user was not found
     */
    public async authenticate(accessToken: string): Promise<PublicUser> {
        const payload = this.jwtService.verifyAccessToken(accessToken);
        const user = await this.users.findById(payload.sub);
        if (!user) {
            throw new Error(`User not found`);
        }
        return this.users.publicizeUser(user);
    }

    /**
     * Refreshes the tokens
     * @param refreshToken The refresh token from the client
     * @returns The new access and refresh tokens
     * @throws If the token is not valid
     * @throws If the user does not exist
     */
    public async refresh(refreshToken: string): Promise<RefreshResult> {
        const payload = this.jwtService.verifyRefreshToken(refreshToken);
        const user = await this.users.findById(payload.sub);
        if (!user) {
            throw new Error(`User not found`);
        }
        return {
            accessToken: this.jwtService.generateAccessToken({ sub: user._id.toString() }),
            refreshToken: this.jwtService.generateRefreshToken({ sub: user._id.toString() }),
        };
    }
}