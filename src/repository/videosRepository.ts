import {VideoType} from "../model/video/VideoType";
import {db} from "../db";
import {CreateVideoInputModel} from "../model/video/dto/CreateVideoInputModel";

export const videosRepository = {
    createVideo(createVideoInputModel: CreateVideoInputModel): VideoType {
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        const newVideo: VideoType = {
            id: new Date().getTime(),
            title: createVideoInputModel.title,
            author: createVideoInputModel.author,
            canBeDownloaded: false,
            minAgeRestriction: null,
            createdAt: today.toISOString(),
            publicationDate: tomorrow.toISOString(),
            availableResolutions: createVideoInputModel.availableResolutions
        }

        db.videos.push(newVideo)
        return newVideo;
    },

    getVideos(): VideoType[] {
        return db.videos;
    },

    getVideoById(id: number): VideoType | undefined {
        return db.videos.find((v) => v.id === id)
    },

    updateVideoById(id: number, updatedVideo: VideoType): boolean {
        const videoIndex = db.videos.findIndex(v => v.id === id);
        if (videoIndex === -1) {
            return false;
        }
        db.videos[videoIndex] = updatedVideo;
        return true;
    },

    deleteVideoById(id: number): boolean {
        const videoIndex = db.videos.findIndex((v) => v.id === id);

        if (videoIndex === -1) {
            return false;
        }

        db.videos.splice(videoIndex, 1);
        return true;
    },

    deleteAllVideos() {
        db.videos = [];
    },
}
