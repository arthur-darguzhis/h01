import {ResolutionType} from "../ResolutionType";

export type CreateVideoInputModel = {
    title: string,
    author: string,
    availableResolutions: Array<ResolutionType>
}
