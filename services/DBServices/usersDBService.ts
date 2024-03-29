/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
import { getRepository, Like, Repository } from "typeorm";
import bcrypt from "bcrypt";
import User from "../../models/DTO/user";
import CommentEntity from "../../models/entities/commentEntity";
import PostEntity from "../../models/entities/postEntity";
import UserEntity from "../../models/entities/userEntity";
import IUsersService from "../interfaces/IUsersService";
import CustomError from "../validators/customError";
import IImagesService from "../interfaces/IImagesService";
import ServiceInjector from "../serviceInjector";

export default class UsersDBService implements IUsersService {
  usersRepository!: Repository<UserEntity>;

  private imagesService: IImagesService;

  constructor(
    imagesService: IImagesService = ServiceInjector.getService<IImagesService>(
      "IImagesService"
    )
  ) {
    this.imagesService = imagesService;
  }

  private instantiateRepo() {
    if (!this.usersRepository) this.usersRepository = getRepository(UserEntity);
  }

  private instantiateImageService() {
    if (!this.imagesService)
      this.imagesService =
        ServiceInjector.getService<IImagesService>("IImagesService");
  }

  private convertEntity(userEntity: UserEntity): User {
    return new User(
      userEntity.id,
      userEntity.name,
      userEntity.email,
      "",
      userEntity.isAdmin,
      userEntity.dateCreated,
      userEntity.dateModified,
      userEntity.active,
      userEntity.image
    );
  }

  private convertEntities(userEntites: UserEntity[]): User[] {
    const users: User[] = [];
    for (let i = 0; i < userEntites.length; i += 1) {
      users.push(this.convertEntity(userEntites[i]));
    }

    return users;
  }

  getAll = async (
    page: number,
    limit: number,
    email?: string,
    search?: string
  ): Promise<{ users: User[]; count: number }> => {
    this.instantiateRepo();
    try {
      let entities: UserEntity[] = [];
      let count = 0;
      if (search !== undefined)
        [entities, count] = await this.usersRepository.findAndCount({
          where: [
            { name: Like(`%${search}%`) },
            { email: Like(`%${search}%`) },
          ],
          skip: (page - 1) * limit,
          take: limit,
        });
      else if (email !== undefined)
        [entities, count] = await this.usersRepository.findAndCount({
          where: email,
          skip: (page - 1) * limit,
          take: limit,
        });
      else
        [entities, count] = await this.usersRepository.findAndCount({
          skip: (page - 1) * limit,
          take: limit,
        });

      if (entities.length === 0 && email !== undefined)
        throw new CustomError(
          404,
          "The user with the given email was not found."
        );

      return { users: this.convertEntities(entities), count };
    } catch (error) {
      throw new CustomError(404, (error as Error).message);
    }
  };

  get = async (id: number): Promise<User> => {
    this.instantiateRepo();
    try {
      if (Number.isNaN(id)) {
        throw new CustomError(400, "The user with the given id was not found.");
      }

      const entity = await this.usersRepository.findOne({ id });
      if (entity === undefined) {
        throw new CustomError(404, "The user with the given id was not found.");
      }

      return this.convertEntity(entity);
    } catch (error) {
      throw new CustomError(404, (error as Error).message);
    }
  };

  add = async (user: User): Promise<User> => {
    this.instantiateRepo();
    try {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const addedUser = await this.usersRepository.save({
        name: user.name,
        email: user.email,
        password: hashedPassword,
        active: true,
        isAdmin: user.isAdmin,
        image: user.image,
      });
      return this.convertEntity(addedUser);
    } catch (error) {
      throw new CustomError(400, (error as Error).message);
    }
  };

  update = async (id: number, user: User): Promise<User> => {
    this.instantiateRepo();
    try {
      const updateUser = await this.usersRepository.findOne({ id });
      if (!updateUser) {
        throw new CustomError(404, "The user with the given id was not found.");
      }

      if (
        updateUser.image !== "" &&
        (user.image === "" || updateUser.image !== user.image)
      ) {
        this.imagesService.delete(updateUser.image);
      }

      if (user.name !== undefined) updateUser.name = user.name;
      if (user.email !== undefined) updateUser.email = user.email;
      if (user.password !== undefined)
        updateUser.password = await bcrypt.hash(user.password, 10);
      if (user.active !== undefined) updateUser.active = user.active;
      if (user.isAdmin !== undefined) updateUser.isAdmin = user.isAdmin;
      if (user.image !== undefined) updateUser.image = user.image;

      await this.usersRepository.update(id, updateUser);
      return this.convertEntity(updateUser);
    } catch (error) {
      throw new CustomError(400, (error as Error).message);
    }
  };

  delete = async (
    id: number,
    deletePosts: boolean,
    deleteComments: boolean
  ): Promise<User> => {
    this.instantiateRepo();
    try {
      if (Number.isNaN(id)) {
        throw new CustomError(400, "Given ID is not in correct format.");
      }
      const user = await this.usersRepository.findOne({ id });
      if (!user) {
        throw new CustomError(404, "The user with the given id was not found.");
      }

      user.active = false;
      await this.usersRepository.save(user);
      if (deletePosts) {
        const postRepository = getRepository(PostEntity);
        postRepository
          .createQueryBuilder()
          .delete()
          .where("author = :id", { id })
          .execute();
      }
      if (deleteComments) {
        const commentsRepository = getRepository(CommentEntity);
        commentsRepository
          .createQueryBuilder()
          .delete()
          .where("author = :id", { id })
          .execute();
      }

      return this.convertEntity(user);
    } catch (error) {
      throw new CustomError(400, (error as Error).message);
    }
  };
}
