import { ErrorRequestHandler } from "express"
import { VARIABLES } from "../../config/environment";

export const errorHandler = (): ErrorRequestHandler => {
    return (err, req, res, next) => {
        const statusCode = 500;

        if (VARIABLES.env === "production") {
            res.status(statusCode).json({
                message: err.message,
            });
        }
        else {
            res.status(statusCode).json({
                message: err.message,
                error: err,
                stack: err.stack,
            });
        }
    };
}
