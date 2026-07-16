import { ErrorRequestHandler } from "express"
import { VARIABLES } from "../../config/environment";
import { AppError } from "../../shared/errors/base";

export const errorHandler = (): ErrorRequestHandler => {
    return (err, req, res, next) => {
        if (err instanceof AppError) {
            return res.status(err.status).json({
                error: {
                    code: err.code,
                    message: err.expose ? err.message : "Internal Server Error",
                },
            });
        }

        return res.status(500).json({
            error: {
                code: "INTERNAL_SERVER_ERRROR",
                message: "Internal server error",
            },
        });
    };
};
