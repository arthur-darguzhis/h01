import {AppError} from "../../exceptions/AppError";
import {Response} from "express";
import {HTTP_STATUSES} from "../../presentationLayer/types/HttpStatuses";
import {EntityAlreadyExists} from "../../exceptions/EntityAlreadyExists";
import {EntityNotFound} from "../../exceptions/EntityNotFound";
import {Forbidden} from "../../exceptions/Forbidden";
import {UnprocessableEntity} from "../../exceptions/UnprocessableEntity";
import {TooManyRequest} from "../../exceptions/TooManyRequest";

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
        let statusCode = HTTP_STATUSES.BAD_REQUEST_400
        if (error instanceof EntityAlreadyExists) statusCode = HTTP_STATUSES.BAD_REQUEST_400
        if (error instanceof UnprocessableEntity) statusCode = HTTP_STATUSES.BAD_REQUEST_400
        if (error instanceof EntityNotFound) statusCode = HTTP_STATUSES.NOT_FOUND_404
        if (error instanceof Forbidden) statusCode = HTTP_STATUSES.FORBIDDEN_403
        if (error instanceof TooManyRequest) statusCode = HTTP_STATUSES.TOO_MANY_REQUEST_429
        response.status(statusCode).json({message: error.message});
    }

    private handleUntrustedError(error: Error | AppError, response?: Response): void {
        if (response) {
            response.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500).json({message: 'Internal server error'});
        }

        console.log('Application encountered an untrusted error.');
        console.log(error);
        // exitHandler.handleExit(1);
    }
}

export const errorHandler = new ErrorHandler();
