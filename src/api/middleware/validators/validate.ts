import { RequestHandler } from "express";
import { z } from "zod";
import { BadRequestError } from "../../../shared/errors/common";

export function validate(schema: z.ZodType): RequestHandler {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            next(new BadRequestError(`Issues with request schema: ${JSON.stringify(result.error.issues)}`));
        }

        req.body = result.data;

        next();
    };
}
