import { BadRequestError, ConflictError, NotFoundError } from "./common";

export class UserNotFoundError extends NotFoundError {
    constructor(identifier: string) {
        super(`User ${identifier} not found`);
        this.code = "USER_NOT_FOUND";
    }
}

export class UserNotOldEnoughError extends BadRequestError {
    constructor() {
        super(`User is not old enough`);
        this.code = "USER_NOT_OLD_ENOUGH";
    }
}

export class UserAlreadyExistsError extends ConflictError {
    constructor(email: string) {
        super(`User with email ${email} already exists`);
        this.code = "USER_ALREADY_EXISTS";
    }
}
