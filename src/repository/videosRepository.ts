import {VideoType} from "../model/video/VideoType";
import {db} from "../db";

export const videosRepository = {
    addVideo(newVideo: VideoType): void {
        db.videos.push(newVideo)
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
