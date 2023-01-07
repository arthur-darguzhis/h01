export type VideoType = {
    id: number,
    title: string,
    author: string,
    canBeDownloaded: boolean,
    minAgeRestriction: null,
    createdAt: string,
    publicationDate: string,
    availableResolutions: Array<string>
}
