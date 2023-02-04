import {AppError} from "./AppError";
import {Response} from "express";
import {HTTP_STATUSES} from "../routes/types/HttpStatuses";
import {APIErrorResultType} from "../routes/types/apiError/APIErrorResultType";
import {EntityAlreadyExists} from "../domain/exceptions/EntityAlreadyExists";

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

        // const apiErrorResult: APIErrorResultType = {
        //     errorsMessages: [{
        //         field: 'email',
        //         message: err.message
        //     }]
        // }
        // return res.status(HTTP_STATUSES.BAD_REQUEST_400).json(apiErrorResult)

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
