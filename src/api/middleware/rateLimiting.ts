import rateLimit from "express-rate-limit";

export const globalRateLimiter = () => {
    return rateLimit({
        windowMs: 60 * 1000,
        limit: 100,
        message: {
            status: 429,
            error: "Too many messages",
            message: "You have exceeded the rate limit.",
        },
        standardHeaders: true,
        legacyHeaders: false,
    });
}
