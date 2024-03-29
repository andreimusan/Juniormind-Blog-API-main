/* eslint-disable prettier/prettier */
import PostsService from "./postsService";
import CommentsService from "./commentsService";
import UsersService from "./usersService";
import ServiceInjector from "./serviceInjector";
import PostsValidatorService from "./validators/postsValidatorService";
import UsersValidator from "./validators/usersValidator";
import UsersDBService from "./DBServices/usersDBService";
import CommentsDBService from "./DBServices/commentsDBService";
import PostsDBService from "./DBServices/postsDBService";
import DBService from "./DBServices/DBService";
import DBConfigValidatorService from "./validators/DBConfigValidator";
import InmemDBService from "./inmemDBService";
import DBChecker from "../middlewares/DBChecker";
import OAuthService from "./oauth/oauthService";
import ImagesDBService from "./DBServices/imagesDBService";
import ImagesService from "./imagesService";
 
export default class ServicesRegister {
  private static RegisterTestServices() {
    ServiceInjector.registerService("IImagesService", new ImagesService());
    ServiceInjector.registerService("ICommentsService", new CommentsService());
    ServiceInjector.registerService("IPostsService", new PostsService());
    ServiceInjector.registerService("IUsersService", new UsersService());
    ServiceInjector.registerService("IDBService", new InmemDBService());
    ServiceInjector.registerService("IDBChecker", new DBChecker());
    ServiceInjector.registerService("IDBConfigValidatorService", new DBConfigValidatorService());
    ServiceInjector.registerService("IPostValidatorService", new PostsValidatorService());
    ServiceInjector.registerService("IUsersValidatorService", new UsersValidator());
  }
 
  private static RegisterProductionServices() {
    ServiceInjector.registerService("IImagesService", new ImagesDBService());
    ServiceInjector.registerService("ICommentsService", new CommentsDBService());
    ServiceInjector.registerService("IPostsService", new PostsDBService());
    ServiceInjector.registerService("IUsersService", new UsersDBService());
    ServiceInjector.registerService("IDBService", new DBService());
    ServiceInjector.registerService("IDBChecker", new DBChecker());
    ServiceInjector.registerService("IDBConfigValidatorService", new DBConfigValidatorService());
    ServiceInjector.registerService("IPostValidatorService", new PostsValidatorService());
    ServiceInjector.registerService("IUsersValidatorService", new UsersValidator());
    ServiceInjector.registerService("IOAuthService", new OAuthService());
  }
 
  static RegisterServices() {
    if (process.env.NODE_ENV === "test") {
      ServicesRegister.RegisterTestServices();
      return;
    }
 
    ServicesRegister.RegisterProductionServices();
  }
}
