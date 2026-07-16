import { AppError } from "./base";

export class BadRequestError extends AppError {
    status = 400;
    code = "BAD_REQUEST";
}

export class UnauthorizedError extends AppError {
    status = 401;
    code = "UNAUTHORIZED";
}

export class ForbiddenError extends AppError {
    status = 403;
    code = "FORBIDDEN";
}

export class NotFoundError extends AppError {
    status = 404;
    code = "NOT_FOUND";
}

export class ConflictError extends AppError {
    status = 409;
    code = "CONFLICT";
}

export class InternalServerError extends AppError {
    status = 500;
    code = "INTERNAL_SERVER_ERROR";
    expose = false;
}

