import {client} from "../db";
import {BlogInputModel} from "../model/blog/BlogInputModel";
import {BlogType} from "../types/BlogType";

export const blogRepository = {
    //Почему здесь при обращении к методу коллекции мы указываем тип? эта запись новая для меня) .collection<BlogType>("blogs")
    //уберите типизацию коллекции посмотрите на ошибку, объясните ее происхождение.
    //marginnote3app://note/B299627A-D44B-44CA-B3CD-1E1714C7B949
    blogsCollection: client.db("hm").collection<BlogType>("blogs"),

    async createBlog(blogInputModel: BlogInputModel): Promise<BlogType> {
        const newBlog: BlogType = {
            id: new Date().getTime().toString(),
            name: blogInputModel.name,
            description: blogInputModel.description,
            websiteUrl: blogInputModel.websiteUrl
        }

        await this.blogsCollection.insertOne(newBlog)
        return newBlog;
    },

    async getBlogs(): Promise<BlogType[]> {
        //Здесь вопрос почему в этом методе нет await а в других есть?
        return await this.blogsCollection.find({}).toArray();
    },

    async getBlogById(id: string): Promise<BlogType | null> {
        return await this.blogsCollection.findOne({id: id});
    },

    async updateBlogById(id: string, blogInputModel: BlogInputModel): Promise<boolean> {
        const result = await this.blogsCollection.updateOne({id: id}, {
            $set: {
                id: id,
                name: blogInputModel.name,
                description: blogInputModel.description,
                websiteUrl: blogInputModel.websiteUrl
            }
        });

        return result.matchedCount === 1;
    },

    async deleteBlogById(id: string): Promise<boolean> {
        const result = await this.blogsCollection.deleteOne({id: id});
        return result.deletedCount === 1
    },

    async deleteAllBlogs(): Promise<void> {
        await this.blogsCollection.drop()
    }
}
