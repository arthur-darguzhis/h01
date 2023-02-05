import {UserType} from "../../src/modules/user/types/UserType";

//Обязательно рассказать что это зачем, и как связанно src/middlewares/jwtAuthGuardMiddleware.ts:17
//Можно вновь почитать https://dev.to/kwabenberko/extend-express-s-request-object-with-typescript-declaration-merging-1nn5
declare global{
    namespace Express {
        interface Request {
            user: UserType | null
        }
    }
}
