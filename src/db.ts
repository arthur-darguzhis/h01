import {PostType} from "./domain/types/PostType";
import {BlogType} from "./domain/types/BlogType";
import {UserType} from "./domain/types/UserType";
import {MongoClient} from "mongodb";
import * as dotenv from "dotenv";

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


export const db: { users: UserType[], blogs: BlogType[], posts: PostType[] } = {
    users: [
        {
            login: 'admin',
            password: 'cXdlcnR5',
        }
    ],
    blogs: [
        {
            id: '1',
            name: 'JavaScript',
            description: 'blog about JS',
            websiteUrl: 'https://habr.com/ru/hub/javascript/',
            createdAt: ''
        },
        {
            id: '2',
            name: 'TypeScript',
            description: 'blog about TS',
            websiteUrl: 'https://habr.com/ru/hub/typescript/',
            createdAt: ''
        }
    ],
    posts: [
        {
            id: '709692',
            title: 'Управление состоянием в React приложения',
            shortDescription: 'Все мы прекрасно знаем что построить полноценный стор на react context достаточно тяжело, а оптимизировать его ещё тяжелее.',
            content: 'Буквально каждую конференцию мы слышим от спикеров, а вы знаете как работают контексты? а вы знаете что каждый ваш слушатель перерисовывает ваш умный компонент (useContext) Пора решить эту проблему раз и на всегда!',
            blogId: '1',
            blogName: 'JavaScript',
            createdAt: '',
        },
        {
            id: '709480',
            title: 'Экстремально уменьшаем размер NPM пакета',
            shortDescription: 'Однажды я захотел создать небольшую NPM библиотеку по всем “best practices” - с покрытием тестами, написанием документации, ведением нормального версионирования и changelog\'а и т.п.',
            content: 'И одной из интересных для меня меня задач при создании библиотеки была задача по максимальному уменьшению размера выходного NPM пакета - того, что в конечном итоге в теории будет использовать другой программист. И в этой статье я бы хотел описать, к каким методам я прибегал для того, чтобы достигнуть желанной цели.',
            blogId: '1',
            blogName: 'JavaScript',
            createdAt: ''
        },
        {
            id: '707744',
            title: 'React + TypeScript: необходимый минимум',
            shortDescription: 'Многие React-разработчики спрашивают себя: надо ли мне учить TypeScript? Еще как надо!',
            content: 'Преимущества изучения TS могут быть сведены к следующему:\n' +
                '\n' +
                '\n' +
                'ваши шансы получить более высокооплачиваемую работу сильно увеличатся;\n' +
                'в вашем коде будет намного меньше багов, его будет легче читать и поддерживать;\n' +
                'рефакторить код и обновлять зависимости станет гораздо проще.',
            blogId: '2',
            blogName: 'TypeScript',
            createdAt: ''
        },
        {
            id: '707496',
            title: 'Мощь декораторов TypeScript на живых примерах. Декорирование методов класса',
            shortDescription: 'В рамках этой статьи разбирается несколько примеров из реальных проектов, где применение декораторов сильно упростило код для понимания и исключило его дублирование.\n' +
                '\n',
            content: 'С помощью декораторов мы можем избежать “дублирования” кода, инкапсулировав сквозную функциональность в отдельный модуль. Убрать лишний “шум” в коде, что позволит сфокусироваться автору на бизнес логике приложения.',
            blogId: '2',
            blogName: 'TypeScript',
            createdAt: ''
        }
    ],
}
