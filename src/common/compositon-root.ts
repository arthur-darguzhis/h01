import "reflect-metadata";
import {UserRepository} from "../modules/user/repository/user.MongoDbRepository";
import {
    EmailConfirmationRepository
} from "../modules/auth/emailConfirmation/repository/emailConfirmation.MongoDbRepository";
import {UsersService} from "../modules/user/usersService";
import {UserQueryRepository} from "../modules/user/repository/user.QueryRepository";
import {UsersController} from "../modules/user/user.controller";
import {Container} from "inversify";
import {LikesOfCommentsRepository} from "../modules/comment/repository/likesOfComments.MongoDbRepository";
import {CommentRepository} from "../modules/comment/repository/comment.MongoDbRepository";
import {PostRepository} from "../modules/post/repository/post.MongoDbRepository";
import {
    UsersActiveSessionsQueryRepository
} from "../modules/security/repository/security.usersActiveSessionsQueryRepository";
import {UsersActiveSessionsRepository} from "../modules/security/repository/security.usersActiveSessionsRepository";
import {BlogRepository} from "../modules/blog/repository/blog.MongoDbRepository";
import {PostQueryRepository} from "../modules/post/repository/post.QueryRepository";
import {PasswordRecoveryRepository} from "../modules/auth/passwordRecovery/passwordRecoveryRepository";
import {CommentQueryRepository} from "../modules/comment/repository/comment.QueryRepository";
import {BlogQueryRepository} from "../modules/blog/repository/blog.QueryRepository";
import {SecurityService} from "../modules/security/securityService";
import {PostsService} from "../modules/post/postsService";
import {BlogsService} from "../modules/blog/blogsService";
import {JwtService} from "../modules/auth/jwt/jwtService";
import {CommentsService} from "../modules/comment/commentsService";
import {AuthService} from "../modules/auth/authService";
import {AuthController} from "../modules/auth/authController";
import {PostController} from "../modules/post/postController";
import {BlogController} from "../modules/blog/blogController";
import {CommentController} from "../modules/comment/commentController";
import {DeviceSessionsController} from "../modules/security/deviceSessionsController";
import {LikesOfPostsRepository} from "../modules/post/repository/likesOfPostsRepository";

export const container = new Container();

//Repositories
container.bind(UserRepository).to(UserRepository);
container.bind(EmailConfirmationRepository).to(EmailConfirmationRepository);
container.bind(LikesOfCommentsRepository).to(LikesOfCommentsRepository);
container.bind(CommentRepository).to(CommentRepository);
container.bind(PostRepository).to(PostRepository);
container.bind(UsersActiveSessionsRepository).to(UsersActiveSessionsRepository);
container.bind(BlogRepository).to(BlogRepository);
container.bind(PasswordRecoveryRepository).to(PasswordRecoveryRepository);
container.bind(LikesOfPostsRepository).to(LikesOfPostsRepository);

//QueryRepositories
container.bind(UserQueryRepository).to(UserQueryRepository);
container.bind(UsersActiveSessionsQueryRepository).to(UsersActiveSessionsQueryRepository);
container.bind(PostQueryRepository).to(PostQueryRepository);
container.bind(CommentQueryRepository).to(CommentQueryRepository);
container.bind(BlogQueryRepository).to(BlogQueryRepository);

//Services
container.bind(UsersService).to(UsersService);
container.bind(SecurityService).to(SecurityService);
container.bind(PostsService).to(PostsService);
container.bind(BlogsService).to(BlogsService);
container.bind(JwtService).to(JwtService);
container.bind(CommentsService).to(CommentsService);
container.bind(AuthService).to(AuthService);

//Controllers
container.bind(UsersController).to(UsersController);
container.bind(AuthController).to(AuthController);
container.bind(PostController).to(PostController);
container.bind(BlogController).to(BlogController);
container.bind(CommentController).to(CommentController);
container.bind(DeviceSessionsController).to(DeviceSessionsController);
