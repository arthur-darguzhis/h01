import {ResolutionType} from "../ResolutionType";

export type UpdateVideoInputModel = {
    title: string,
    author: string,
    canBeDownloaded: boolean,
    minAgeRestriction: number | null,
    publicationDate: string,
    availableResolutions: Array<ResolutionType>
}
