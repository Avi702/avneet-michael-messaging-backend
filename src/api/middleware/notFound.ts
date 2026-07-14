import { Request, Response } from "express";

export const notFound = () => {
    return (req: Request, res: Response) => {
        res.status(404).json({ error: "Unable to find page." });
    }
}
