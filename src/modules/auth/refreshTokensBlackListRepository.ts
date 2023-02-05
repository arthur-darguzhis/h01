import {dbConnection} from "../../db";
import {jwtType} from "../jwt/types/JwtType";
import {CommandMongoDbRepository} from "../../common/repositories/CommandMongoDbRepository";

class RefreshTokensBlackListRepository extends CommandMongoDbRepository<jwtType, object>{
    async isTokenInBlackList(userId: string, refreshToken: string): Promise<jwtType | null> {
        return await this.collection.findOne({userId: userId, refreshToken: refreshToken})
    }

    async add(jwt: jwtType): Promise<jwtType> {
        await this.collection.insertOne(jwt)
        return jwt
    }
}

export const refreshTokensBlackListRepository = new RefreshTokensBlackListRepository(dbConnection, 'refreshTokenBlackList')
