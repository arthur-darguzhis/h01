export class AppError extends Error {
    public isOperational: boolean;

    constructor(message: string, isOperational: boolean = true) {
        super(message);
        this.isOperational = isOperational;

        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this);
    }
}
