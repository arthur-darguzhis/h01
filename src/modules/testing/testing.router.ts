import {Router} from "express";
import {HTTP_STATUSES} from "../../common/presentationLayer/types/HttpStatuses";
import mongoose from "mongoose";

export const testingRouter = Router({})

testingRouter.delete('/all-data', async (req, res) => {
    await mongoose.connection.dropDatabase();
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})

// const getUserFromDb = async () => {
//     return new Promise(() => {
//         throw new Error('This is an async error');
//     });
// };
//
// //TODO write tests for this end points.
// testingRouter.get('/sync', (_, res: Response) => {
//     throw new Error('This is a sync error');
//
//     res.json({ status: 'error ' });
// });
//
// testingRouter.get('/async', async (_, res: Response) => {
//     const user = await getUserFromDb();
//
//     res.json(user);
// });
//
// testingRouter.get('/reject', async (_, res: Response) => {
//     new Promise((_, reject) => {
//         reject('This is a rejected promise');
//     });
//
//     res.json({ status: 'error' });
// });
//
// testingRouter.get('/user/:id', async (_, res: Response) => {
//     if (!res.locals.user) {
//         throw new AppError({ httpCode: HTTP_STATUSES.UNAUTHORIZED_401, description: 'You must be logged in' });
//     }
//
//     const user = await getUserFromDb();
//
//     if (!user) {
//         throw new AppError({
//             httpCode: HTTP_STATUSES.NOT_FOUND_404,
//             description: 'User you are looking for does not exist',
//         });
//     }
//
//     res.json(user);
// });
