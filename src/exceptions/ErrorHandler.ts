import {AppError} from "./AppError";
import {Response} from "express";
import {HTTP_STATUSES} from "../routes/types/HttpStatuses";

class ErrorHandler {
    public handleError(error: Error | AppError, response?: Response): void {
        if (this.isTrustedError(error) && response) {
            this.handleTrustedError(error as AppError, response);
        } else {
            this.handleUntrustedError(error, response);
        }
    }

    public isTrustedError(error: Error): boolean {
        if (error instanceof AppError) {
            return error.isOperational;
        }

        return false;
    }

    private handleTrustedError(error: AppError, response: Response): void {
        //Here should be switch case
        response.status(501).json({ message: error.message });
    }

    private handleUntrustedError(error: Error | AppError, response?: Response): void {
        if (response) {
            response.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500).json({ message: 'Internal server error' });
        }

        console.log('Application encountered an untrusted error.');
        console.log(error);
        // exitHandler.handleExit(1);
    }
}

export const errorHandler = new ErrorHandler();
