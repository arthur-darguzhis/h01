import {VideoType} from "./model/video/VideoType";
import {ResolutionType} from "./model/video/ResolutionType";

export const db: { videos: VideoType[] } = {
    videos: [
        {
            id: 1,
            title: "first video",
            author: "first operator",
            canBeDownloaded: true,
            minAgeRestriction: null,
            createdAt: "2023-01-01T14:44:05.254Z",
            publicationDate: "2023-01-01T14:44:05.254Z",
            availableResolutions: [
                ResolutionType.P144
            ]
        },
        {
            id: 2,
            title: "second video",
            author: "second operator",
            canBeDownloaded: true,
            minAgeRestriction: null,
            createdAt: "2023-01-02T14:44:05.254Z",
            publicationDate: "2023-01-02T14:44:05.254Z",
            availableResolutions: [
                ResolutionType.P144
            ]
        },
        {
            id: 3,
            title: "third video",
            author: "third operator",
            canBeDownloaded: true,
            minAgeRestriction: null,
            createdAt: "2023-01-03T14:44:05.254Z",
            publicationDate: "2023-01-03T14:44:05.254Z",
            availableResolutions: [
                ResolutionType.P144
            ]
        },
        {
            id: 4,
            title: "fourth video",
            author: "fourth operator",
            canBeDownloaded: true,
            minAgeRestriction: null,
            createdAt: "2023-01-04T14:44:05.254Z",
            publicationDate: "2023-01-04T14:44:05.254Z",
            availableResolutions: [
                ResolutionType.P144
            ]
        },
    ]
}
