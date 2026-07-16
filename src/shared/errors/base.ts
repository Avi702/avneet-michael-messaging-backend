export abstract class AppError extends Error {
    public abstract readonly status: number;
    public abstract readonly code: string;
    public readonly expose: boolean;

    public constructor(message: string, expose: boolean = true) {
        super(message);

        this.name = this.constructor.name;
        this.expose = expose;

        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace?.(this, this.constructor);
    }
}
