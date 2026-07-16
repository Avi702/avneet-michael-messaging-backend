import { UnauthorizedError } from "./common";

export class PasswordIncorrectError extends UnauthorizedError {
    constructor() {
        super(`Password incorrect`);
        this.code = "PASSWORD_INCORRECT";
    }
}

export class InvalidTokenError extends UnauthorizedError {
    constructor() {
        super(`Token is invalid`);
        this.code = "INVALID_TOKEN";
    }
}
