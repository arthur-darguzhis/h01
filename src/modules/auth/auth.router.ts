import {container} from "../../common/compositon-root";
import {Router} from "express";
import {checkErrorsInRequestDataMiddleware} from "../../common/middlewares/checkErrorsInRequestDataMiddleware";
import {validateLogin} from "./middlewares/validateLogin";
import {jwtAuthGuardMiddleware} from "./middlewares/jwtAuthGuardMiddleware";
import {validateUser} from "../user/middlewares/validateUser";
import {jwtRefreshGuardMiddleware} from "./middlewares/jwtRefreshGuardMiddleware";
import {checkRateLimiterMiddleware, setRateLimiter} from "../../common/middlewares/rateLimiterMiddleware";
import {body} from "express-validator";
import {AuthController} from "./authController";

export const authRouter = Router({});

const authController = container.resolve(AuthController);

authRouter.post('/registration',
    checkRateLimiterMiddleware,
    validateUser.body.email,
    validateUser.body.login,
    validateUser.body.password,
    checkErrorsInRequestDataMiddleware,
    authController.registerNewUser.bind(authController))

authRouter.post('/registration-confirmation',
    setRateLimiter(5, 10),
    authController.userConfirmEmail.bind(authController))

authRouter.post('/registration-email-resending',
    setRateLimiter(5, 10),
    validateUser.body.email,
    checkErrorsInRequestDataMiddleware,
    authController.userResentConfirmEmail.bind(authController))

authRouter.post('/login',
    setRateLimiter(5, 10),
    validateLogin.body.loginOrEmail,
    validateLogin.body.password,
    checkErrorsInRequestDataMiddleware,
    authController.userLogin.bind(authController))

authRouter.post('/refresh-token', jwtRefreshGuardMiddleware, authController.refreshToken.bind(authController))

authRouter.post('/logout',
    jwtRefreshGuardMiddleware,
    authController.userLogout.bind(authController)
)

authRouter.post('/password-recovery',
    setRateLimiter(5, 10),
    validateUser.body.email,
    checkErrorsInRequestDataMiddleware,
    authController.userRequestPasswordRecovery.bind(authController))

authRouter.post('/new-password',
    setRateLimiter(5, 10),
    body('newPassword').trim().isLength({min: 6, max: 20}),
    body('recoveryCode').trim().isLength({min: 15}),
    checkErrorsInRequestDataMiddleware,
    authController.userSetNewPassword.bind(authController))

authRouter.get('/me', jwtAuthGuardMiddleware,
    authController.getInfoAboutCurrentUser.bind(authController))
