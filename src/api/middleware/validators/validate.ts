import { RequestHandler } from "express";
import mongoose from "mongoose";
import { z } from "zod";

export function validate(schema: z.ZodType): RequestHandler {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                errors: result.error.issues,
            });
        }

        req.body = result.data;

        next();
    };
}

export const zObjectId = z.string().refine(
    value => mongoose.Types.ObjectId.isValid(value),
    { message: "Invalid MongoDB object" },
);
