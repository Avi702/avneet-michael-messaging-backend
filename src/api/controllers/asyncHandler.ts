import { RequestHandler } from "express";

/**
 * Creates a promise-based handler for a controller handler function
 * @param handler The controller handler function
 * @returns The controller handler function, wrapped for error handling
 */
export function asyncHandler(handler: RequestHandler): RequestHandler {
    return (req, res, next) => {
        Promise.resolve(handler(req, res, next)).catch(next);
    }
}
