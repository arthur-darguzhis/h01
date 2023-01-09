import {CreateVideoInputModel} from "../model/video/dto/CreateVideoInputModel";
import {UpdateVideoInputModel} from "../model/video/dto/UpdateVideoInputModel";
import {APIErrorResultType} from "../model/apiError/APIErrorResultType";
import {FieldErrorType} from "../model/apiError/FieldErrorType";
import {ResolutionType} from "../model/video/ResolutionType";

export const validateCreateVideoModel = (body: CreateVideoInputModel): APIErrorResultType => {
    const APIErrorResult: APIErrorResultType = {
        errorsMessages: []
    }

    validateTitleField(body.title, APIErrorResult);
    validateAuthorField(body.author, APIErrorResult);
    validateAvailableResolutionField(body.availableResolutions, APIErrorResult);

    return APIErrorResult;
}

export const validateUpdateVideoModel = (body: UpdateVideoInputModel): APIErrorResultType => {
    const APIErrorResult: APIErrorResultType = {
        errorsMessages: []
    }

    validateTitleField(body.title, APIErrorResult);
    validateAuthorField(body.author, APIErrorResult);
    validateAvailableResolutionField(body.availableResolutions, APIErrorResult);
    validateMinAgeRestrictionField(body.minAgeRestriction, APIErrorResult);
    validatePublicationDateField(body.publicationDate, APIErrorResult);
    validateCanBeDownloadedField(body.canBeDownloaded, APIErrorResult);

    return APIErrorResult;
}

const validateTitleField = (title: string, APIErrorResult: APIErrorResultType): void => {
    if (!title) {
        const titleFieldError: FieldErrorType = {
            message: 'should not be blank',
            field: 'title'
        }
        APIErrorResult.errorsMessages.push(titleFieldError)
    } else if (title.length > 40) {
        const titleFieldError: FieldErrorType = {
            message: 'maxLength is 40 chars',
            field: 'title'
        }
        APIErrorResult.errorsMessages.push(titleFieldError)
    }
}

const validateAuthorField = (author: string, APIErrorResult: APIErrorResultType): void => {
    if (!author) {
        const authorFieldError: FieldErrorType = {
            message: 'should not be blank',
            field: 'author'
        }
        APIErrorResult.errorsMessages.push(authorFieldError)
    } else if (author.length > 20) {
        const authorFieldError: FieldErrorType = {
            message: 'maxLength is 20 chars',
            field: 'author'
        }
        APIErrorResult.errorsMessages.push(authorFieldError)
    }
}

const validateAvailableResolutionField = (availableResolutions: Array<ResolutionType>, APIErrorResult: APIErrorResultType): void => {
    if (!availableResolutions) {
        return;
    }

    const hasOnlyAvailableResolutions = availableResolutions.every((r) => ResolutionType[r] !== undefined)
    if (!hasOnlyAvailableResolutions) {
        const availableResolutionsFieldError: FieldErrorType = {
            message: 'Data has unavailable resolution',
            field: 'availableResolutions'
        }
        APIErrorResult.errorsMessages.push(availableResolutionsFieldError);
    }

    if (availableResolutions.length === 0) {
        const availableResolutionsFieldError: FieldErrorType = {
            message: 'At least one resolution should be added',
            field: 'availableResolutions'
        }
        APIErrorResult.errorsMessages.push(availableResolutionsFieldError);
    }
}

const validateMinAgeRestrictionField = (minAgeRestriction: number | null, APIErrorResult: APIErrorResultType): void => {
    if (minAgeRestriction && (minAgeRestriction < 1 || minAgeRestriction > 18)) {
        const minAgeRestrictionFieldError: FieldErrorType = {
            message: 'correct value is between 1 and 18',
            field: 'minAgeRestriction'
        }
        APIErrorResult.errorsMessages.push(minAgeRestrictionFieldError)
    }
}

const validatePublicationDateField = (publicationDate: string, APIErrorResult: APIErrorResultType): void => {
    if (!publicationDate) {
        return;
    }
    const parsedPublicationDate = Date.parse(publicationDate);
    const date = new Date(parsedPublicationDate);

    if (date.toISOString() !== publicationDate) {
        const publicationDateFieldError: FieldErrorType = {
            message: 'date format must be ISO',
            field: 'publicationDate'
        }
        APIErrorResult.errorsMessages.push(publicationDateFieldError)
    }
}

const validateCanBeDownloadedField = (canBeDownloaded: boolean, APIErrorResult: APIErrorResultType): void => {
    if (typeof canBeDownloaded !== "boolean") {
        const titleFieldError: FieldErrorType = {
            message: 'must be boolean type',
            field: 'canBeDownloaded'
        }
        APIErrorResult.errorsMessages.push(titleFieldError)
    }
}

export const isValid = (result: APIErrorResultType): boolean => {
    return result.errorsMessages.length === 0
}
