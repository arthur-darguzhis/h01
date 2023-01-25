import {PostType} from "./domain/types/PostType";
import {BlogType} from "./domain/types/BlogType";
import {UserType} from "./domain/types/UserType";
import {MongoClient} from "mongodb";
import * as dotenv from "dotenv";
import {CommentType} from "./domain/types/CommentType";

dotenv.config()

const mongoUri = process.env.MONGO_URI
if (!mongoUri) {
    throw new Error('MongoDB URI is not found')
}

export const client: MongoClient = new MongoClient(mongoUri);
const dbConnection = client.db();
//Почему здесь при обращении к методу коллекции мы указываем тип? эта запись новая для меня) .collection<BlogType>("blogs")
//уберите типизацию коллекции посмотрите на ошибку, объясните ее происхождение.
//marginnote3app://note/B299627A-D44B-44CA-B3CD-1E1714C7B949
export const blogsCollection = dbConnection.collection<BlogType>("blogs");
export const postsCollection = dbConnection.collection<PostType>("posts");
export const usersCollection = dbConnection.collection<UserType>("users");
export const commentsCollection = dbConnection.collection<CommentType>("comments")

//Расскажите почему эта функция не стрелочная и при чем здесь замыкание и переменная client? =)
export async function runDb() {
    try {
        //connect the client to the server
        await client.connect();
        //Это тестовый пинг к базе данных hm, но здесь может быть что угодно
        await client.db('hm').command({ping: 1})
        console.log('Connected successfully to mongoServer');
        //Почему в catch нет "e"? разве так можно?
    } catch {
        //Ensure that the client will close when you finish/error
        await client.close();
    }
}


export const db: { users: UserType[]} = {
    users: [
        {
            _id: '1009',
            login: 'admin',
            password: 'cXdlcnR5',
            email: 'test@test.ts',
            createdAt: ''
        }
    ]
}
